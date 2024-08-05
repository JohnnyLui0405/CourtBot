import express from "express";
import { mongoClient, db } from "../utils/mongodb.js";
import { logger } from "../utils/logger.js";

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

app.get("/auth/discord", async (req, res) => {
    logger.info(`Discord auth request from ${req.ip}`);
    // res.sendFile("auth.html", { root: "./src/web" });
    logger.info(`access code is ${req.query.code}`);
    res.send("OK");
});

app.listen(port, () => {
    console.log(`URL Shortener listening on port ${port}`);
});
