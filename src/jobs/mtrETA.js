import { CronJob } from "cron";
import { logger } from "../utils/logger.js";
import { db } from "../utils/mongodb.js";
import axios from "axios";
import { EmbedBuilder } from "discord.js";

export const job = {
    name: "mtrETA",
};

export const action = async (client) => {
    return new CronJob("* * * * *", async () => {
        logger.info(`Running ${job.name} job...`);

        const staDict = {
            LOW: "羅湖",
            LMC: "落馬洲",
            ADM: "金鐘",
        };
        const url = "https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=EAL&sta=UNI";
        const channelCollection = db.collection("guild");
        const guilds = await channelCollection.find({ mtrChannel: { $exists: true } }).toArray();

        const mtrETA = await axios.get(url);
        const etaData = mtrETA.data.data["EAL-UNI"];

        const upDest = [];
        const upEta = [];

        const downDest = [];
        const downEta = [];

        etaData.UP.forEach((train) => {
            upDest.push(staDict[train.dest] || train.dest);
            upEta.push(train.ttnt);
        });

        etaData.DOWN.forEach((train) => {
            downDest.push(staDict[train.dest] || train.dest);
            downEta.push(train.ttnt);
        });

        const upEmbed = new EmbedBuilder()
            .setTitle("大學站港鐵列車到站時間(上行)")
            .setColor(0x205781)
            .setFooter({ text: "最後更新時間: " + new Date().toLocaleString() })
            .addFields({ name: "目的地", value: upDest.join("\n"), inline: true }, { name: "預計分鐘", value: upEta.join("\n"), inline: true });

        const downEmbed = new EmbedBuilder()
            .setTitle("大學站港鐵列車到站時間(下行)")
            .setColor(0x4f959d)
            .setFooter({ text: "最後更新時間: " + new Date().toLocaleString() })
            .addFields({ name: "目的地", value: downDest.join("\n"), inline: true }, { name: "預計分鐘", value: downEta.join("\n"), inline: true });

        guilds.forEach(async (guild) => {
            const channel = await client.channels.fetch(guild.mtrChannel);
            const message = await channel.messages.fetch(guild.mtrMessage);
            await message.edit({ content: "", embeds: [upEmbed, downEmbed] });
        });
        logger.info(`${job.name} job Done!`);
    });
};
