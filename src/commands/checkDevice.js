import { EmbedBuilder, SlashCommandBuilder, userMention } from "discord.js";
import { logger } from "../utils/logger.js";

export const command = new SlashCommandBuilder()
    .setName("查詢用戶裝置")
    .setDescription("Check user device")
    .addUserOption((option) => option.setName("user").setDescription("使用者").setRequired(true));

/**
 *
 * @param {CommandInteraction} ctx
 */
export const action = async (ctx) => {
    const user = ctx.options.getUser("user");

    const member = await ctx.guild.members.fetch(user.id);

    const device = member.presence.clientStatus;

    const embed = new EmbedBuilder()
        .setTitle("用戶裝置查詢")
        .setColor(0x33ccff)
        .setFields({ name: "使用者", value: userMention(user.id) }, { name: "裝置", value: Object.keys(device).join(", ") })
        .setFooter({ text: "感謝您使用服務！" })
        .setTimestamp(new Date());

    await ctx.reply({ embeds: [embed] });
};
