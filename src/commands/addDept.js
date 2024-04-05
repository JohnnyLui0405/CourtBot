import { BaseInteraction, ButtonBuilder, EmbedBuilder, ActionRowBuilder, SlashCommandBuilder, userMention } from "discord.js";
import { logger } from "../utils/logger.js";

export const command = new SlashCommandBuilder()
    .setName("新增債務")
    .setDescription("追債服務")
    .addMentionableOption((option) => option.setName("debtor").setDescription("邊個爭你錢呀?").setRequired(true))
    .addNumberOption((option) => option.setName("amount").setDescription("佢爭你幾錢?").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("備註").setRequired(true).setMaxLength(20))
    .addIntegerOption((option) => option.setName("duedate").setDescription("你想幾時開始幫你追數?(日數e.g. 3)").setRequired(false));

/**
 *
 * @param {BaseInteraction} ctx
 */
export const action = async (ctx) => {
    const client = ctx.client;
    const deptCollection = client.mongoClient.db("CourtBot").collection("debt");

    const user = ctx.options.getMentionable("debtor");
    const amount = ctx.options.getNumber("amount");

    // get duedate by adding the number of days to the current date
    const createdDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (ctx.options.getInteger("duedate") || 0));
    dueDate.setHours(0, 0, 0, 0);
    await deptCollection.insertOne({
        debtorId: user.id,
        debtorName: user.displayName,
        creditorId: ctx.user.id,
        creditorName: ctx.user.displayName,
        amount: amount,
        status: 0,
        reason: ctx.options.getString("reason"),
        dueDate: dueDate,
        createdDate: createdDate,
    });

    logger.info(
        `${ctx.user.displayName}(${ctx.user.id}) added a new debt to ${user.displayName}(${user.id}) | Amount: ${amount} | Reason: ${ctx.options.getString(
            "reason"
        )} | Due Date: ${dueDate.toLocaleDateString()} | Created Date: ${createdDate.toLocaleDateString()}`
    );

    const embed = new EmbedBuilder()
        .setTitle("追債指示確認")
        .setColor(0x33ccff)
        .setFields(
            { name: "債務人", value: userMention(user.id) },
            { name: "債權人", value: userMention(ctx.member.id) },
            { name: "金額", value: amount + " 元" },
            { name: "備註", value: ctx.options.getString("reason") },
            { name: "債務到期日", value: dueDate.toLocaleDateString() },
            { name: "指示創建日", value: createdDate.toLocaleDateString() }
        )
        .setFooter({ text: "感謝您使用追債服務助理！" })
        .setTimestamp(new Date());

    await ctx.reply({ embeds: [embed] });
    await user.send({ content: "你有一筆新債務，請查看:", embeds: [embed] });
};
