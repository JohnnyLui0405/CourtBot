import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { logger } from "../utils/logger.js";

export const command = new SlashCommandBuilder()
    .setName("setchannelformtreta")
    .setDescription("Real Time ETA for MTR trains.")
    .addChannelOption((option) => option.setName("channel").setDescription("Channel to set for MTR ETA").setRequired(true));

export const action = async (ctx) => {
    const client = ctx.client;
    const channelCollection = client.db.collection("guild");

    const channel = ctx.options.getChannel("channel");
    const message = await channel.send("MTR ETA set up in progress...");
    const inserted = await channelCollection.updateOne({ _id: channel.guild.id }, { $set: { mtrChannel: channel.id, mtrMessage: message.id } }, { upsert: true });

    logger.info(`${ctx.user.displayName}(${ctx.user.id}) set channel for MTR ETA | Channel: ${channel.id} Message: ${message.id}`);

    const embed = new EmbedBuilder()
        .setTitle("Channel Set")
        .setColor(0x33ccff)
        .setFields({ name: "Channel", value: `<#${channel.id}>` })
        .setFooter({ text: "Thank you for using the service!" })
        .setTimestamp(new Date());

    await ctx.reply({ embeds: [embed] });
};
