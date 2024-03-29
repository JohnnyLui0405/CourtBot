import { BaseInteraction, ButtonBuilder, EmbedBuilder, ActionRowBuilder, SlashCommandBuilder, userMention } from "discord.js";
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
 * @param {BaseInteraction} ctx
 */
export const action = async (ctx) => {
    const client = ctx.client;
    const deptCollection = client.mongoClient.db("CourtBot").collection("debt");

    const user = ctx.options.getMentionable("debtor");
    const amount = ctx.options.getNumber("amount");

    await deptCollection.insertOne({
        debtorId: user.id,
        debtorName: user.displayName,
        creditorId: ctx.user.id,
        creditorName: ctx.user.displayName,
        amount: amount,
        status: 0,
        createdDate: new Date(),
    });

    const embed = new EmbedBuilder().setTitle("追債服務").setColor(0x33ccff).setDescription(`收到你 ${userMention(user.id)} 爭你 ${amount} 蚊`).setTimestamp(new Date());

    await ctx.reply({ embeds: [embed] });


};
