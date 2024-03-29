
import { BaseInteraction, ButtonBuilder, EmbedBuilder, ActionRowBuilder, SlashCommandBuilder, userMention, CommandInteraction } from "discord.js";
import { logger } from "../utils/logger.js";

export const command = new SlashCommandBuilder()
    .setName("新增債務")
    .setDescription("追債服務")
    .addMentionableOption((option) => option.setName("debtor").setDescription("邊個爭你錢呀?").setRequired(true))
    .addNumberOption((option) => option.setName("amount").setDescription("佢爭你幾錢?").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("備註").setRequired(true))
    .addIntegerOption((option) => option.setName("duedate").setDescription("你想幾時開始幫你追數?").setRequired(false));

/**
 *
 * @param {CommandInteraction} ctx
 */
export const action = async (ctx) => {
    const client = ctx.client;

    const addButton = new ButtonBuilder().setLabel("新增債務").setStyle("PRIMARY").setCustomId("addDebt");
    const cancelButton = new ButtonBuilder().setLabel("取消債務").setStyle("DANGER").setCustomId("cancelDebt");
    const listAllButton = new ButtonBuilder().setLabel("查看所有債務").setStyle("SECONDARY").setCustomId("listAllDebt");
    const row = new ActionRowBuilder().addComponents(addButton, cancelButton, listAllButton);
    await ctx.reply({ components: [row], content: "請選擇功能" });

};
