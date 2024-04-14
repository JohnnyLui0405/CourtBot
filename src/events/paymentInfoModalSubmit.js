/* eslint-disable no-case-declarations */
import { Events, ModalSubmitInteraction, userMention } from "discord.js";
import { logger } from "../utils/logger.js";
import { ObjectId } from "mongodb";

export const event = {
    name: Events.InteractionCreate,
};

/**
 *
 * @param {ModalSubmitInteraction} interaction
 */
export const action = async (interaction) => {
    if (!interaction.isModalSubmit() || !interaction.customId == "addPaymentInfoModal") return;
    const client = interaction.client;
    const paymentInfoCollection = client.db.collection("paymentInfo");
    const debtCollection = client.db.collection("debt");

    logger.info(`${interaction.user.displayName}(${interaction.user.id}) submitted modal ${interaction.customId}`);

    const receiverName = interaction.fields.getTextInputValue("receiverName");
    const paymeURL = interaction.fields.getTextInputValue("paymeURLInput");
    const FPS = interaction.fields.getTextInputValue("FPSInput");

    if (!(paymeURL || FPS)) {
        const embed = client.debtEmbedBuilder().setTitle("請輸入至少一個付款資訊").setColor(0xff0000);
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    await paymentInfoCollection.updateOne({ _id: interaction.user.id }, { $set: { userName: interaction.user.username, receiverName, paymeURL, FPS } }, { upsert: true });

    const embed = client
        .debtEmbedBuilder()
        .setTitle("已更新付款資訊")
        .setColor(0x33ccff)
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
        .setDescription(`收款人名稱: ${receiverName}\nPayMe URL: ${paymeURL}\nFPS: ${FPS}`);
    await interaction.reply({ embeds: [embed], ephemeral: true });
    logger.info(`Updated user ${interaction.user.id} with receiverName: ${receiverName}, paymeURL: ${paymeURL}, FPS: ${FPS}`);

    const debts = await debtCollection.aggregate([{ $match: { creditorId: interaction.user.id, status: 0 } }, { $group: { _id: "$debtorId" } }]).toArray();

    debts.forEach(async (debt) => {
        try {
            const debtor = await client.users.fetch(debt._id);
            const paymentInfoEmbed = client
                .debtEmbedBuilder()
                .setTitle("債權人收款資訊")
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
                .setFields({ name: "收款人名稱", value: receiverName }, { name: "PayMe URL", value: paymeURL || "N/A" }, { name: "FPS", value: FPS || "N/A" });
            await debtor.send({ content: `${userMention(debt._id)} 已更新收款資訊`, embeds: [paymentInfoEmbed] });
            logger.info(`Notified ${debtor.username}(${debtor.id}) about the updated payment info`);
        } catch (error) {
            logger.error(error);
        }
    });
};
