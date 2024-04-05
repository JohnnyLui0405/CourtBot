import { CronJob } from "cron";
import axios from "axios";
import { EmbedBuilder } from "discord.js";
import { logger } from "../utils/logger.js";

export const job = {
    name: "A&EWaitingTime",
};

export const action = async (client) => {
    return new CronJob("*/5 * * * *", async () => {
        logger.info(`Running ${job.name} job...`);
        const res = await axios.get("https://www.ha.org.hk/opendata/aed/aedwtdata-tc.json");
        const waitTimeData = res.data.waitTime;
        logger.debug(JSON.stringify(res.data));

        const embed = new EmbedBuilder().setTitle("急症室等候時間").setColor(0x44b37f);
        waitTimeData.forEach(async (hospital) => {
            embed.addFields({ name: hospital.hospName, value: `等候時間: ${hospital.topWait}`, inline: true });
        });
        embed.setFooter({ text: "資料來源: 醫院管理局 | 最後更新時間" + new Date().toLocaleString("zh-HK", { timeZone: "Asia/Hong_Kong" }) });

        const channel = await client.channels.fetch(client.config.AnEWaitingTimeChannelId);
        const msg = await channel.messages.fetch(client.config.AnEWaitingTimeMessageId);
        await msg.edit({ embeds: [embed] });
        logger.info(`${job.name} job Done!`);
    });
};
