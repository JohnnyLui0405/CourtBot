import { EmbedBuilder, SlashCommandBuilder, userMention, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

export const command = new SlashCommandBuilder().setName("getmember").setDescription("test");

export const action = async (ctx) => {
    const client = ctx.client;

    const members = await ctx.guild.members.fetch();

    members.forEach((member) => {
        console.log(member.displayName);
        console.log(member.id);
    });
};
