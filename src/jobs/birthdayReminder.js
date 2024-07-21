import { CronJob } from "cron";
import { logger } from "../utils/logger.js";
import { userMention, EmbedBuilder } from "discord.js";

export const job = {
    name: "birhtdayReminder",
};

export const action = async (client) => {
    return new CronJob("0 0 * * *", async () => {
        logger.info(`Running ${job.name} job...`);

        const today = new Date();
        const userColleciton = client.db.collection("user");

        const users = await userColleciton.find({ $expr: { $and: [{ $eq: [{ $month: "$birthday" }, today.getMonth()] }, { $eq: [{ $dayOfMonth: "$birthday" }, today.getDay()] }] } }).toArray();

        for (const userData of users) {
            const user = await client.users.fetch(userData._id);
            const yearOld = today.getFullYear() - userData.birthday.getFullYear();
            const birhtdayEmbed = new EmbedBuilder()
                .setColor(0x33ccff)
                .setAuthor({ name: user.username, iconURL: user.avatarURL() })
                .setTitle(`${yearOld}歲 生日快樂 🎉🎉🎉`)
                .setDescription(userMention(user.id))
                .setThumbnail("https://media1.tenor.com/m/TeyoU-sVwCcAAAAC/happy-birthday-dog.gif")
                .setTimestamp(today)
                .setFooter({ text: "Birthday Reminder" });

            const channel = await client.channels.fetch(client.config.birthdayChannelId);
            await channel.send({ content: userMention(user.id), embeds: [birhtdayEmbed] });
            logger.info(`Sent birthday message to ${user.username}(${user.id}) in ${channel.id}`);
        }

        logger.info(`${job.name} job Done!`);
    });
};
