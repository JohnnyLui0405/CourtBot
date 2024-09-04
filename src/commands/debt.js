import { BaseInteraction, ButtonBuilder, EmbedBuilder, ActionRowBuilder, SlashCommandBuilder, userMention, CommandInteraction, ButtonStyle, Options } from "discord.js";
import { logger } from "../utils/logger.js";

export const command = new SlashCommandBuilder().setName("追債公司").setDescription("追債服務");

/**
 *
 * @param {CommandInteraction} ctx
 */
export const action = async (ctx) => {
    const client = ctx.client;

    const addButton = new ButtonBuilder().setLabel("完成債務").setStyle(ButtonStyle.Primary).setCustomId("finishDebt");
    const cancelButton = new ButtonBuilder().setLabel("取消債務").setStyle(ButtonStyle.Danger).setCustomId("cancelDebt");
    const listAllButton = new ButtonBuilder().setLabel("查看所有債務").setStyle(ButtonStyle.Secondary).setCustomId("listAllDebt");
    const addPaymentInfo = new ButtonBuilder().setLabel("新增收款資訊").setStyle(ButtonStyle.Success).setCustomId("addPaymentInfo");
    const checkDebtHistory = new ButtonBuilder().setLabel("查看債務歷史").setStyle(ButtonStyle.Secondary).setCustomId("checkDebtHistory");
    const embed = new EmbedBuilder()
        .setTitle("追債服務助理")
        .setDescription("歡迎使用追債服務助理")
        .setFields(
            {
                name: "主要功能",
                value: "- 債務追蹤: 輕鬆追蹤未清償債務\n- 自動提醒: 設定提醒以確保及時付款\n- 通訊工具: 直接與債務人溝通\n- 可自訂指令: 依您的需求調整指令\n- 安全與隱私: 保護敏感的債務相關資料\n- 使用者友善介面: 簡單管理任務\n- 全天候可用: 隨時隨地存取服務\n",
            },
            {
                name: "如何使用",
                value: "- 請點擊下方按鈕 來 執行相應的指令\n- 跟隨提示輸入債務人訊息，設定提醒，並與債務人溝通",
            }
        )
        .setFooter({ text: "追債服務助理在此幫助您實現成功的債務收回結果" })
        .setColor(0x44b37f);
    const firstRow = new ActionRowBuilder().addComponents(addPaymentInfo, addButton, cancelButton);
    const secondRow = new ActionRowBuilder().addComponents(listAllButton, checkDebtHistory);

    await ctx.reply({ embeds: [embed], components: [firstRow, secondRow] });
};
