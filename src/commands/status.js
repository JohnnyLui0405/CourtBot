import { EmbedBuilder, SlashCommandBuilder, userMention } from "discord.js";
import { logger } from "../utils/logger.js";

export const command = new SlashCommandBuilder()
    .setName("status")
    .setDescription("check your voice time and level.")
    .addMentionableOption((option) => option.setName("user").setDescription("User to be checked").setRequired(false));

export const action = async (ctx) => {
    const client = ctx.client;
    const userCollection = client.mongoClient.db("CourtBot").collection("user");

    const user = ctx.options.getMentionable("user") || ctx.user;
    const userData = await userCollection.findOne({ _id: user.id.toString() });

    if (!userData) {
        await userCollection.insertOne({ _id: user.id.toString(), username: user.username, level: 0, xp: 0, voiceTime: 0 });
    }

    const requiredXp = Math.floor(((userData.level + 1) / 0.7) ** 2);

    logger.debug("requiredXp: " + requiredXp);

    const embed = new EmbedBuilder();
    embed.setTitle("狀態");
    embed.setThumbnail(user.displayAvatarURL());

    embed.addFields(
        { name: "📛名稱", value: userMention(user.id), inline: true },
        { name: "🎚️等級", value: userData.level.toString(), inline: true },
        { name: "🆙升級進度(分鐘)", value: `${userData.voiceDuration}/${requiredXp}` },
        { name: "⌛語音時數", value: userData.voiceDuration.toString() + "分鐘" }
    );

    await ctx.reply({ embeds: [embed] });
};
