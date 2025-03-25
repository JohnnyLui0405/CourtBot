import express from "express";
import { mongoClient, db } from "./utils/mongodb.js";
import { logger } from "./utils/logger.js";
import axios from "axios";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import ShortUniqueID from "short-unique-id";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT;
const urlCollection = db.collection("url");
const baseURL = process.env.BASE_URL;

app.use(session({ secret: process.env.SECRET, resave: true, saveUninitialized: false, store: MongoStore.create({ client: mongoClient }), rolling: true, cookie: { maxAge: 1000 * 60 * 60 } }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('views', './src/views');
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
    if (!req.session.userId) {
        res.redirect("/login");
        return;
    }
    res.redirect("/dashboard");
});

app.get("/login", async (req, res) => {
    res.render("index", { redirect_uri: process.env.REDIRECT_URI });
});

app.get("/dashboard", async (req, res) => {
    logger.info(`Dashboard request from ${req.ip} with session ${JSON.stringify(req.session)}`);
    if (!req.session.userId) {
        res.redirect("/");
        return;
    }

    let urls = await db.collection("url").find({ creator: req.session.userId }).sort({ createdDate: -1 }).toArray();
    urls = urls.map((url) => {
        url.shortURL = `${baseURL}/${url._id}`;
        url.clicks = url.clicks || 0;
        url.original = url.url;
        return url;
    }
    );
    const PER_PAGE = 10;
    const page = parseInt(req.query.page) || 1;
    const totalUrls = urls.length;

    res.render("dashboard", { user: { username: req.session.username }, urls, page: page, totalUrls: totalUrls, perPage: PER_PAGE });
});

app.post("/shorten", async (req, res) => {
    logger.info(`${req.ip} | ${req.session.userId} | Shorten request ${req.body.originalUrl}`);
    if (!req.session.userId) {
        res.status(401).send("Unauthorized");
        return;
    }

    const { originalUrl } = req.body;

    const urlRegex = /^(http|https):\/\/[^ "]+$/;

    if (!urlRegex.test(originalUrl)) {
        res.status(400).send("Invalid URL");
        return;
    }

    if ((await urlCollection.countDocuments({ url: originalUrl, creator: req.session.userId })) > 0) {
        res.status(400).send("Duplicate URL");
        return;
    }

    const uidGenerator = new ShortUniqueID({ length: 7 });

    let uid = uidGenerator.rnd();

    while ((await urlCollection.countDocuments({ _id: uid })) > 0) {
        uid = uidGenerator().rnd();
    }

    const urlData = await urlCollection.insertOne({ _id: uid, url: originalUrl, creator: req.session.userId, createdDate: new Date(), clicks: 0 });
    res.send({ shortURL: `${baseURL}/${urlData.insertedId}` });
}
);

app.get("/:shortURLId", async (req, res) => {
    logger.info(`URL ${req.params.shortURLId} clicked by ${req.ip}`);
    const shortURLId = req.params.shortURLId;
    const urlData = await urlCollection.findOne({ _id: shortURLId });
    if (!urlData?.url) {
        res.status(404).send("Not found");
        return;
    }
    await urlCollection.updateOne({ _id: shortURLId }, { $inc: { clicks: 1 } });

    logger.info(`Redirecting ${req.ip} to ${urlData.url}`);
    res.redirect(urlData.url);
});

app.get("/auth/discord", async (req, res) => {
    logger.info(`Discord auth request from ${req.ip}`);
    // res.sendFile("auth.html", { root: "./src/web" });
    logger.info(`access code is ${req.query.code}`);

    const code = req.query.code;
    if (code) {
        try {

            const tokenResponseData = await axios.post('https://discord.com/api/oauth2/token', {
                client_id: process.env.APPLICATION_ID,
                client_secret: process.env.CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.REDIRECT_URI,
                scope: 'identify',
            }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

            const oauthData = tokenResponseData.data;
            logger.debug(oauthData.data);

            const userResult = await axios.get('https://discord.com/api/users/@me', { "headers": { 'Authorization': `${oauthData.token_type} ${oauthData.access_token}` } });
            logger.info(`Discord | ${JSON.stringify(userResult.data)}`);

            req.session.userId = userResult.data.id;
            req.session.username = userResult.data.username;
            req.session.discriminator = userResult.data.discriminator;
            req.session.avatar = userResult.data.avatar;

            res.redirect("/dashboard");

            // res.send(`Hi ${userResult.data.username}`);

        } catch (error) {
            // NOTE: An unauthorized token will not throw an error
            // tokenResponseData.statusCode will be 401
            console.error(error);
        }
    }
});

app.post("/auth/logout", async (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

app.listen(port, () => {
    console.log(`URL Shortener listening on port ${port}`);
});
