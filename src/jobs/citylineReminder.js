import { CronJob } from "cron";
import { Client, EmbedBuilder } from "discord.js";
import { logger } from "../utils/logger.js";
import axios from "axios";

export const job = {
    name: "citylineReminder",
};
/**
 *
 * @param {Client} client
 * @returns
 */
export const action = async (client) => {
    return new CronJob("*/1 * * * * *", async () => {
        if (new Date() / 1000 < 1713144600) return;
        if (client.isCitylineSent) return;
        try {
            const request = await axios.get("https://shows.cityline.com/url/2024/iuherworldtourhk.1713146400000.1lsda5.json?v=10");
            const data = request.data;
            logger.debug(JSON.stringify(data));
            client.isCitylineSent = true;
            const developer = await client.users.fetch("334534960654450690");
            await developer.send({
                embeds: [new EmbedBuilder().setTitle("Cityline Reminder").setDescription(`${data.url}`).setColor(0x33ccff).setTimestamp(new Date())],
            });
            const channel = await client.channels.fetch("1229048495034597397");
            await channel.send({
                embeds: [new EmbedBuilder().setTitle("Cityline Reminder").setDescription(`${data.url}`).setColor(0x33ccff).setTimestamp(new Date())],
            });

            logger.debug(developer);
        } catch (error) {
            logger.error(error);
        }

        logger.info(`${job.name} job Done!`);
    });
};
