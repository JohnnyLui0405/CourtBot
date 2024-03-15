import { CronJob } from "cron";
import axios from "axios";
import { EmbedBuilder } from "discord.js";
import { db } from "../utils/mongodb.js";
import { logger } from "../utils/logger.js";
import Parser from "rss-parser";
const parser = new Parser();

export const job = {
    name: "waterReminder",
};

export const action = async (client) => {
    return new CronJob("0 */2 * * *", async () => {
        logger.info(`Running ${job.name} job...`);
        const channel = await client.channels.fetch("757821286553616449");
        await channel.send({
            content: `<@&1217867336858603740>\n見字飲水`,
        });
        logger.info(`${job.name} job Done!`);
    });
};
