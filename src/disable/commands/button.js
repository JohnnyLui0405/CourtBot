import { EmbedBuilder, SlashCommandBuilder, userMention, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

export const command = new SlashCommandBuilder().setName("button").setDescription("test");

export const action = async (ctx) => {
    const userCollection = mongoClient.db("CourtBot").collection("User");

    // create a button
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("japan").setLabel("填資料").setStyle(ButtonStyle.Primary));
    await ctx.channel.send({
        content: `@everyone\n填一填資料買保險`,
        components: [row],
    });
};
