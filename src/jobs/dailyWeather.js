import { CronJob } from "cron";
import axios from "axios";
import { EmbedBuilder } from "discord.js";
import { logger } from "../utils/logger.js";

export const job = {
    name: "dailyWeathers",
};

export const action = async (client) => {
    return new CronJob("0 8 * * *", async () => {
        logger.info(`Running ${job.name} job...`);
        const res = await axios.get("https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=flw&lang=tc");
        logger.info(res.data);
        const text = `${res.data.generalSituation}\n${res.data.tcInfo}\n\n${res.data.forecastPeriod}\n${res.data.forecastDesc}\n${res.data.outlook}`;

        const channel = await client.channels.fetch("897419340490616843");
        await channel.send({
            embeds: [new EmbedBuilder().setTitle("每日天氣報告").setDescription(text).setColor(0x44b37f).setTimestamp(new Date())],
        });
        logger.info(`${job.name} job Done!`);
    });
};
