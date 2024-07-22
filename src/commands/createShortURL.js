import { Colors, EmbedBuilder, SlashCommandBuilder, userMention } from "discord.js";
import { logger } from "../utils/logger.js";
import ShortUniqueID from "short-unique-id";

export const command = new SlashCommandBuilder()
    .setName("建立短網址")
    .setDescription("Create a short URL")
    .addStringOption((option) => option.setName("url").setDescription("URL to shorten").setRequired(true));

export const action = async (ctx) => {
    const client = ctx.client;
    const urlCollection = client.db.collection("url");

    const user = ctx.user;
    const url = ctx.options.getString("url");
    // regex to check if the url is valid
    const urlRegex = /^(http|https):\/\/[^ "]+$/;

    if (!urlRegex.test(url)) {
        const invalidEmbed = client.mainEmbedBuilder().setTitle("網址無效 Invalid URL").setDescription("請提供有效的連結 Please provide a valid URL").setColor(Colors.Red);
        await ctx.reply({ embeds: [invalidEmbed] });
        return;
    }

    if ((await urlCollection.countDocuments({ url: url, creator: ctx.user.id })) > 0) {
        const duplicateEmbed = client.mainEmbedBuilder().setTitle("重複的網址 Duplicate URL").setDescription("您已經建立過這個網址 You have already created this URL").setColor(Colors.Red);
        await ctx.reply({ embeds: [duplicateEmbed] });
    }

    const uidGenerator = new ShortUniqueID({ length: 7 });

    let uid = uidGenerator.rnd();

    while ((await urlCollection.countDocuments({ _id: uid })) > 0) {
        uid = uidGenerator().rnd();
    }

    await urlCollection.insertOne({ _id: uid, url: url, creator: user.id, createdDate: new Date(), clicks: 0 });

    const urlBase = process.env.NODE_ENV === "production" ? process.env.PRD_URL_SHORTENER_BASE : process.env.UAT_URL_SHORTENER_BASE;

    const embed = client
        .mainEmbedBuilder()
        .setTitle("短網址已建立 Short URL Created")
        .setColor(Colors.Green)
        .setFields({ name: "原始網址 Original URL", value: url }, { name: "短網址 Short URL", value: `${urlBase}/${uid}` });

    ctx.reply({ embeds: [embed] });
};
