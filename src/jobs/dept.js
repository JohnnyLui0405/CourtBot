import { CronJob } from "cron";
import axios from "axios";
import { Client, EmbedBuilder, userMention } from "discord.js";
import { logger } from "../utils/logger.js";

export const job = {
    name: "dept",
};

/**
 *
 * @param {Client} client
 *
 */
export const action = async (client) => {
    return new CronJob("*/20 * * * *", async () => {
        logger.info(`Running ${job.name} job...`);
        const debtCollection = client.mongoClient.db("CourtBot").collection("debt");

        const activeDebtList = await debtCollection.find({ status: 0 }).toArray();

        activeDebtList.forEach(async (debt) => {
            const debtor = await client.users.fetch(debt.debtor.userId);
            const embed = new EmbedBuilder().setTitle("催債服務").setColor(0x33ccff).setDescription(`你仲未還 ${debt.amount} 蚊比 ${userMention(debt.creditorId)}`);
            await debtor.send({ embeds: [embed] });
        });


        logger.info(`${job.name} job Done!`);
    });
};
