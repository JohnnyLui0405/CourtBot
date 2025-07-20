import { CronJob } from "cron";
import axios from "axios";
import { db } from "../utils/mongodb.js";
import { logger } from "../utils/logger.js";
import { EmbedBuilder } from "discord.js";

export const job = {
    name: "weatherWarnings",
};

export const action = async (client) => {
    return new CronJob("30 * * * * *", async () => {
        logger.info(`Running ${job.name} job...`);
        const res = await axios.get("https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=tc");
        const swtRes = await axios.get("https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=swt&lang=tc");

        const collection = db.collection("weather");
        const data = await collection.findOne({ _id: "weather_warnings" });
        const channel = await client.channels.fetch(client.config.dailyWeatherChannelId);

        for (const [key, value] of Object.entries(res.data)) {
            if (!["WTCSGNL", "WRAIN"].includes(key)) continue;
            if (value == undefined) continue;
            if (!(data[key] == undefined || data[key].updateTime != value.updateTime)) continue;
            console.log(key);

            let warningText;
            let warningColor = 0xffcc01;
            let thumbnailURL;

            switch (key) {
                case "WTCSGNL":
                    warningText = value.type;
                    break;
                case "WRAIN":
                    warningText = value.type + value.name;
                    break;
                case "WHOT":
                    warningText = value.name;
                    break;
            }

            switch (value.code) {
                case "WRAINA":
                case "TC1":
                case "TC3":
                    warningColor = 0xffcc01;
                    break;
                case "WRAINR":
                case "TC8NE":
                case "TC8SE":
                case "TC8SW":
                case "TC8NW":
                    warningColor = 0xff0000;
                    break;
                case "WRAINB":
                case "TC9":
                case "TC10":
                    warningColor = 0x000000;
                    break;
            }

            if (value.actionCode == "ISSUE") {
                logger.info(JSON.stringify(data[key]));
                logger.info(`Weather warning changed: ${key} ${JSON.stringify(value)}`);
                data[key] = value;
                await collection.updateOne({ _id: "weather_warnings" }, { $set: data });
                // channel Id 922161753247338536
                if (value.code == "WHOT") thumbnailURL = `https://www.hko.gov.hk/en/wxinfo/dailywx/images/vhot.gif`;
                else thumbnailURL = `https://www.hko.gov.hk/en/wxinfo/dailywx/images/${value.code.toLowerCase()}.gif`;
                console.log(thumbnailURL);
                await channel.send({
                    content: `@everyone`,
                    embeds: [new EmbedBuilder().setTitle(`天文台發出${warningText}`).setColor(warningColor).setThumbnail(thumbnailURL).setTimestamp(new Date(value.issueTime))],
                });
            } else if (value.actionCode == "CANCEL") {
                if (data[key] == undefined) continue;
                logger.info(`Weather warning removed: ${key}`);
                await channel.send({
                    content: `@everyone`,
                    embeds: [new EmbedBuilder().setTitle(`天文台取消${warningText}`).setColor(0x808080).setTimestamp(new Date())],
                });
                delete data[key];
                await collection.updateOne({ _id: "weather_warnings" }, { $unset: { [key]: "" } });
            }
        }
        // {"swt":[{"desc":"預料強陣風繼續吹襲香港。如身處室外，請儘快到安全地方躲避。 在下午6時45分左右，流浮山錄得每小時約75公里的強陣風。","updateTime":"2024-08-18T18:50:00+08:00"},{"desc":"短期內香港廣泛地區可能受大雨影響，市民應提高警覺。","updateTime":"2024-08-18T18:25:00+08:00"}]}
        for (const tips of swtRes.data.swt) {
            if (new Date().getTime() - new Date(tips.updateTime).getTime() <= 80 * 1000) {
                await channel.send({
                    content: `@everyone`,
                    embeds: [client.mainEmbedBuilder().setTitle("天文台特別天氣提示").setDescription(tips.desc).setColor(0xffcc01).setTimestamp(new Date(tips.updateTime))],
                });
            }
        }
        logger.info(`${job.name} job Done!`);
    });
};
