import { BaseInteraction, ButtonBuilder, EmbedBuilder, ActionRowBuilder, SlashCommandBuilder, userMention, ButtonStyle } from "discord.js";
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
    const deptCollection = client.db.collection("debt");
    const paymentInfoCollection = client.db.collection("paymentInfo");

    const user = ctx.options.getMentionable("debtor");
    const amount = ctx.options.getNumber("amount");

    // get duedate by adding the number of days to the current date
    const createdDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (ctx.options.getInteger("duedate") || 0));
    dueDate.setHours(0, 0, 0, 0);
    const inserted = await deptCollection.insertOne({
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
            { name: "ID", value: inserted.insertedId.toHexString() },
            { name: "債務人", value: userMention(user.id) },
            { name: "債權人", value: userMention(ctx.member.id) },
            { name: "金額", value: amount + " 元", inline: true },
            { name: "備註", value: ctx.options.getString("reason"), inline: true },
            { name: "債務到期日", value: dueDate.toLocaleDateString() },
            { name: "指示創建日", value: createdDate.toLocaleDateString() }
        )
        .setFooter({ text: "感謝您使用追債服務助理！" })
        .setTimestamp(new Date());

    if ((await paymentInfoCollection.countDocuments({ _id: ctx.user.id })) === 0) {
        const setupPaymentInfoReminderEmbed = client.debtEmbedBuilder().setTitle("新增收款資訊").setDescription("請新增收款資訊，以便您的債務人可以付款給您").setColor(0x33ccff);
        const setupPaymentInfoButton = new ButtonBuilder().setLabel("新增收款資訊").setStyle(ButtonStyle.Primary).setCustomId("addPaymentInfo");
        const row = new ActionRowBuilder().addComponents(setupPaymentInfoButton);
        await ctx.reply({ embeds: [embed, setupPaymentInfoReminderEmbed], components: [row], ephemeral: true });
        await user.send({ content: "你有一筆新債務，請查看:", embeds: [embed] });
        return;
    }

    await ctx.reply({ embeds: [embed], ephemeral: true });

    const paymentInfo = await paymentInfoCollection.findOne({ _id: ctx.user.id });
    const paymentInfoEmbed = client
        .debtEmbedBuilder()
        .setTitle("對方的收款資訊")
        .setDescription(`收款人名稱: ${paymentInfo.receiverName}\nPayMe URL: ${paymentInfo.paymeURL || "N/A"}\nFPS: ${paymentInfo.FPS || "N/A"}`)
        .setColor(0x33ccff);
    await user.send({ content: "你有一筆新債務，請查看:", embeds: [embed, paymentInfoEmbed] });
};
