import express from "express";
import { mongoClient, db } from "../utils/mongodb.js";
import { logger } from "../utils/logger.js";
import axios from "axios";

const app = express();
const port = 80;
const urlCollection = db.collection("url");

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

app.use('/public', express.static("/Users/johnnylui/Desktop/GitProject/CourtBot/src/web/public"));

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
                redirect_uri: `http://localhost/auth/discord`,
                scope: 'identify',
            }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

            const oauthData = tokenResponseData.data;
            logger.debug(oauthData.data);

            const userResult = await axios.get('https://discord.com/api/users/@me', { "headers": { 'Authorization': `${oauthData.token_type} ${oauthData.access_token}` } });
            logger.info(JSON.stringify(userResult.data));

            res.send(`Hi ${userResult.data.username}`);

        } catch (error) {
            // NOTE: An unauthorized token will not throw an error
            // tokenResponseData.statusCode will be 401
            console.error(error);
        }
    }
});

app.listen(port, () => {
    console.log(`URL Shortener listening on port ${port}`);
});
