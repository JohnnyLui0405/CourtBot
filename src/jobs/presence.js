import { CronJob } from "cron";
import { EmbedBuilder } from "discord.js";
import { db } from "../utils/mongodb.js";
import { logger } from "../utils/logger.js";
import { ActivityType } from "discord.js";
import axios from "axios";

export const job = {
    name: "presence",
};

const getWeatherWarnings = async () => {
    const weatherData = await axios.get("https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=tc");
    return weatherData.data;
};

let count = 0;
let countTotal = 2;
let weatherData = null;
export const action = async (client) => {
    return new CronJob("*/10 * * * * *", async () => {
        logger.info(`Running ${job.name} job...`);

        if (count === 0) {
            weatherData = await getWeatherWarnings();

            countTotal = 2;
            countTotal += weatherData.warningMessage.length;
            logger.info(`Count total: ${countTotal}`);

            const currentTime = `${new Date().toLocaleTimeString("zh-HK", { timeZone: "Asia/Hong_Kong" })} (GMT+8)`;
            logger.info(`Current time: ${currentTime}`);

            await client.user.setActivity(currentTime, { type: ActivityType.Listening });
        } else if (count == 1) {
            const uvIndex = weatherData.uvindex.data[0].value;
            const temperature = weatherData.temperature.data[0].value;
            const humidity = weatherData.humidity.data[0].value;
            await client.user.setActivity(`溫度: ${temperature}°C | 濕度: ${humidity}% | UV: ${uvIndex}`, { type: ActivityType.Listening });
            logger.info(`UV Index: ${uvIndex} | Temperature: ${temperature}°C | Humidity: ${humidity}%`);
        } else {
            const weatherWarning = weatherData.warningMessage[count - 2];
            await client.user.setActivity(weatherWarning, { type: ActivityType.Listening });
            logger.info(`Weather warning: ${weatherWarning}`);
        }

        count = (count + 1) % countTotal;

        logger.info(`${job.name} job Done!`);
    });
};
