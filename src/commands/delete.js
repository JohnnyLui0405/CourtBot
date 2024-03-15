import { EmbedBuilder, SlashCommandBuilder, userMention, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

export const command = new SlashCommandBuilder()
    .setName("delete")
    .setDescription("Delete Messages")
    .addIntegerOption((option) => option.setName("number").setDescription("Number of messages to delete").setRequired(true));

export const action = async (ctx) => {
    const number = ctx.options.getInteger("number");
    console.log(number);
    await ctx.channel.bulkDelete(number);
};
