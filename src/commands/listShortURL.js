import { Colors, EmbedBuilder, SlashCommandBuilder, userMention } from "discord.js";
import { logger } from "../utils/logger.js";
import ShortUniqueID from "short-unique-id";

export const command = new SlashCommandBuilder().setName("查看已建立的短網址").setDescription("View all short URLs");

export const action = async (ctx) => {
    const client = ctx.client;
    const urlCollection = client.db.collection("url");

    const user = ctx.user;

    const shortUrls = await urlCollection.find({ creator: user.id }).toArray();

    if (shortUrls.length === 0) {
        const emptyEmbed = client.mainEmbedBuilder().setTitle("沒有短網址 No Short URLs").setDescription("您尚未建立任何短網址 You have not created any short URLs").setColor(Colors.Red);
        await ctx.reply({ embeds: [emptyEmbed] });
        return;
    }

    const embed = client.mainEmbedBuilder().setTitle("已建立的短網址 Short URLs Created").setColor(Colors.Blue);

    // create short URL list string
    const urlBase = process.env.NODE_ENV === "production" ? process.env.PRD_URL_SHORTENER_BASE : process.env.UAT_URL_SHORTENER_BASE;
    const shortUrlListString = shortUrls
        .map((shortUrl) => {
            return `[${shortUrl._id}](${urlBase}/${shortUrl._id}) - ${shortUrl.url} - Clicks: ${shortUrl.clicks}`;
        })
        .join("\n");

    embed.setDescription(shortUrlListString);

    ctx.reply({ embeds: [embed] });
};
