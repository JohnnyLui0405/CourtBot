/* eslint-disable no-case-declarations */
import {
    Events,
    EmbedBuilder,
    ButtonInteraction,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    StringSelectMenuOptionBuilder,
    InteractionCollector,
    ComponentType,
    userMention,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";
import { logger } from "../utils/logger.js";
import { ObjectId } from "mongodb";

export const event = {
    name: Events.InteractionCreate,
};

/**
 *
 * @param {ButtonInteraction} interaction
 */
export const action = async (interaction) => {
    if (!interaction.isButton()) return;
    const client = interaction.client;
    const mongoClient = client.mongoClient;
    const deptCollection = mongoClient.db("CourtBot").collection("debt");

    logger.info(`${interaction.user.displayName}(${interaction.user.id}) clicked button ${interaction.customId}`);

    if (interaction.customId.startsWith("remindDebt")) {
        console.log(interaction.customId);
        const debtId = new ObjectId(interaction.customId.split("-")[1]);
        const debt = await deptCollection.findOne({ _id: debtId });
        if (debt.status !== 0) {
            await interaction.reply("此債務已完成或取消", { ephemeral: true });
            return;
        }
        const remindEmbed = client
            .debtEmbedBuilder()
            .setTitle("完成債務提醒")
            .setColor(0x33ccff)
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
            .setDescription(`${userMention(debt.debtorId)} 提醒你 他已償還債務 ${debt.reason} | 金額: ${debt.amount} | 到期日: ${debt.dueDate.toLocaleDateString()}`);
        const creditor = await client.users.fetch(debt.creditorId);
        await creditor.send({ embeds: [remindEmbed] });
        await interaction.reply({ content: "已提醒對方", ephemeral: true });
        const disabledRemindButton = new ButtonBuilder().setCustomId(`remindDebt-${debtId.toHexString()}`).setLabel("已提醒").setStyle(ButtonStyle.Secondary).setDisabled(true);
        await interaction.message.edit({ components: [new ActionRowBuilder().setComponents(disabledRemindButton)] });
        return;
    }

    const debts = await deptCollection.find({ debtorId: interaction.member.id, status: 0 }).toArray();
    const credits = await deptCollection.find({ creditorId: interaction.member.id, status: 0 }).toArray();

    switch (interaction.customId) {
        case "addPaymentInfo":
            const receiverName = new TextInputBuilder()
                .setLabel("收款人姓名")
                .setCustomId("receiverName")
                .setPlaceholder("請輸入收款人姓名")
                .setMaxLength(20)
                .setRequired(true)
                .setStyle(TextInputStyle.Short);
            const paymeURLInput = new TextInputBuilder()
                .setLabel("Payme付款連結")
                .setCustomId("paymeURLInput")
                .setPlaceholder("請輸入付款連結")
                .setMaxLength(200)
                .setRequired(false)
                .setStyle(TextInputStyle.Short);
            const FPSInput = new TextInputBuilder().setLabel("FPS帳號").setCustomId("FPSInput").setPlaceholder("請輸入FPS帳號").setMaxLength(20).setRequired(false).setStyle(TextInputStyle.Short);

            const firstRow = new ActionRowBuilder().addComponents(receiverName);
            const secondRow = new ActionRowBuilder().addComponents(paymeURLInput);
            const thirdRow = new ActionRowBuilder().addComponents(FPSInput);

            const PaymentInfomodal = new ModalBuilder().addComponents(firstRow, secondRow, thirdRow).setTitle("新增收款資訊").setCustomId("addPaymentInfoModal");
            await interaction.showModal(PaymentInfomodal);

            break;
        case "finishDebt":
        case "cancelDebt":
            if (credits.length === 0) {
                const embed = client.debtEmbedBuilder().setTitle("債務列表").setDescription("您目前沒有任何放債");
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }
            const finishRow = new ActionRowBuilder();
            const finishSelectMenu = new StringSelectMenuBuilder().setCustomId("finishDebtSelect").setPlaceholder("請選擇欲完成的債務");
            credits.forEach((credit, index) => {
                finishSelectMenu.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${index + 1}. ${credit.debtorName} 欠您 ${credit.amount} 元`).setValue(credit._id.toHexString()));
            });
            finishRow.addComponents(finishSelectMenu);
            const actionText = interaction.customId === "finishDebt" ? "完成" : "取消";
            await interaction.reply({ content: `請選擇欲${actionText}的債務`, components: [finishRow], ephemeral: true });
            const fliter = (i) => i.user.id === interaction.user.id;
            interaction.channel
                .awaitMessageComponent({ fliter: fliter, componentType: ComponentType.StringSelect, time: 60000 })
                .then(async (selectInteraction) => {
                    const debtId = new ObjectId(selectInteraction.values[0]);

                    const debt = await deptCollection.findOne({ _id: debtId });
                    const status = interaction.customId === "finishDebt" ? 1 : 2;
                    const finishDebtQuery = await deptCollection.updateOne({ _id: debtId }, { $set: { status: status } });
                    logger.info(`Debt ${debtId.toHexString()} has been finished by ${interaction.member.id} | Status: ${status}`);
                    await selectInteraction.reply({ content: `您已完成 ${debt.debtorName} 欠您 ${debt.amount} 元 的債務`, ephemeral: true });
                })
                .catch(async (err) => {
                    logger.error(err);
                    await interaction.editReply({ content: "操作已取消", components: [] });
                });
            break;
        case "listAllDebt":
            if (debts.length === 0 && credits.length === 0) {
                const embed = client.debtEmbedBuilder().setTitle("債務列表").setDescription("您目前沒有任何債務");
                await interaction.reply({ embeds: [embed] });
                return;
            }

            const debtsEmbed = client.debtEmbedBuilder().setTitle("欠債列表").setColor(0xff0000);
            const creditsEmbed = client.debtEmbedBuilder().setTitle("放債列表").setColor(0x00ff00);

            debtsEmbed.setDescription("您目前的欠債");
            if (debts.length === 0) debtsEmbed.setDescription("您目前沒有任何欠債");
            debts.forEach((debt, index) => {
                debtsEmbed.addFields({ name: `${index + 1}. 您欠 ${debt.creditorName} ${debt.amount} 元`, value: `備註: ${debt.reason} | 到期日: ${debt.dueDate.toLocaleDateString()}` });
            });

            creditsEmbed.setDescription("您目前的放債");
            if (credits.length === 0) creditsEmbed.setDescription("您目前沒有任何放債");
            credits.forEach((credit, index) => {
                creditsEmbed.addFields({ name: `${index + 1}. ${credit.debtorName} 欠您 ${credit.amount} 元`, value: `備註: ${credit.reason} | 到期日: ${credit.dueDate.toLocaleDateString()}` });
            });

            await interaction.reply({ embeds: [debtsEmbed, creditsEmbed], ephemeral: true });
            break;
        default:
            break;
    }
};
