import { CronJob } from "cron";
import axios from "axios";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, userMention } from "discord.js";
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
    return new CronJob("0 21 * * *", async () => {
        logger.info(`Running ${job.name} job...`);
        const debtCollection = client.mongoClient.db("CourtBot").collection("debt");
        const now = new Date();
        now.setDate(now.getDate() - 1);
        const activeDebtList = await debtCollection.find({ status: 0, dueDate: { $lt: now } }).toArray();

        activeDebtList.forEach(async (debt) => {
            const debtor = await client.users.fetch(debt.debtorId);
            const embed = new EmbedBuilder()
                .setTitle("追債服務助理")
                .setColor(0x33ccff)
                .setDescription(`你仲未還 ${debt.amount} 蚊比 ${userMention(debt.creditorId)}\n到期日: ${debt.dueDate.toLocaleDateString()}\n備註: ${debt.reason}`);
            const remindButton = new ButtonBuilder().setLabel("通知已償還債務").setStyle(ButtonStyle.Success).setCustomId(`remindDebt-${debt._id.toHexString()}`);
            const row = new ActionRowBuilder().addComponents(remindButton);
            await debtor.send({ embeds: [embed], components: [row] });
            logger.info(`Reminded ${debtor.username}(${debtor.id}) to repay ${debt.amount} to ${debt.creditorName}(${debt.creditorId})`);
        });

        logger.info(`${job.name} job Done!`);
    });
};
