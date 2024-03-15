import { CronJob } from "cron";
import axios from "axios";
import { EmbedBuilder } from "discord.js";
import { db } from "../utils/mongodb.js";
import { logger } from "../utils/logger.js";
import Parser from "rss-parser";
const parser = new Parser();

export const job = {
    name: "internationalNews",
};

export const action = async (client) => {
    return new CronJob("* * * * *", async () => {
        logger.info(`Running ${job.name} job...`);
        const feed = await parser.parseURL("https://rthk9.rthk.hk/rthk/news/rss/c_expressnews_cinternational.xml");
        const collection = db.collection("news");
        feed.items.forEach(async (item) => {
            const data = await collection.findOne({ _id: item.guid });
            if (data == undefined) {
                await collection.insertOne({
                    _id: item.guid,
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                });
                const channel = await client.channels.fetch("1142323123493015602");
                await channel.send({
                    embeds: [new EmbedBuilder().setTitle(item.title).setURL(item.link).setDescription(item.content).setColor(0x44b37f).setTimestamp(new Date(item.isoDate))],
                });
            }
        });
        logger.info(`${job.name} job Done!`);
    });
};
