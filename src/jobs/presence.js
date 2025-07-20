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

let presenceIndex = 0;
let maxPresenceIndex = 2;
let weatherData = null;
export const action = async (client) => {
    return new CronJob("*/10 * * * * *", async () => {
        logger.info(`Running ${job.name} job...`);

        if (presenceIndex === 0) {
            weatherData = await getWeatherWarnings();

            maxPresenceIndex = 2;
            maxPresenceIndex += weatherData.warningMessage.length;
            logger.info(`Count total: ${maxPresenceIndex}`);

            const currentTime = `${new Date().toLocaleTimeString("zh-HK", { timeZone: "Asia/Hong_Kong" })} (GMT+8)`;
            logger.info(`Current time: ${currentTime}`);

            await client.user.setActivity(currentTime, { type: ActivityType.Listening });
        } else if (presenceIndex === 1) {
            const uvIndex = weatherData.uvindex && Array.isArray(weatherData.uvindex.data) && weatherData.uvindex.data.length > 0 ? weatherData.uvindex.data[0].value : "N/A";
            const temperature = weatherData.temperature.data[0].value;
            const humidity = weatherData.humidity.data[0].value;
            if (uvIndex === "N/A") {
                logger.warn("UV Index data is missing or invalid.");
            }
            await client.user.setActivity(`溫度: ${temperature}°C | 濕度: ${humidity}% | UV: ${uvIndex}`, { type: ActivityType.Listening });
            logger.info(`UV Index: ${uvIndex} | Temperature: ${temperature}°C | Humidity: ${humidity}%`);
        } else {
            const weatherWarning = weatherData.warningMessage[presenceIndex - 2];
            await client.user.setActivity(weatherWarning, { type: ActivityType.Listening });
            logger.info(`Weather warning: ${weatherWarning}`);
        }

        presenceIndex = (presenceIndex + 1) % maxPresenceIndex;

        logger.info(`${job.name} job Done!`);
    });
};
