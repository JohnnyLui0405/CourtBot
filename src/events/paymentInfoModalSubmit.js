/* eslint-disable no-case-declarations */
import { Events, ModalSubmitInteraction } from "discord.js";
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
    const mongoClient = client.mongoClient;
    const userCollection = mongoClient.db("CourtBot").collection("user");

    logger.info(`${interaction.user.displayName}(${interaction.user.id}) submitted modal ${interaction.customId}`);

    const receiverName = interaction.fields.getTextInputValue("receiverName");
    const paymeURL = interaction.fields.getTextInputValue("paymeURLInput");
    const FPS = interaction.fields.getTextInputValue("FPSInput");

    if (!(paymeURL || FPS)) {
        const embed = client.debtEmbedBuilder().setTitle("請輸入至少一個付款資訊").setColor(0xff0000);
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    await userCollection.updateOne({ _id: interaction.user.id }, { $set: { receiverName, paymeURL, FPS } }, { upsert: true });

    const embed = client
        .debtEmbedBuilder()
        .setTitle("已更新付款資訊")
        .setColor(0x33ccff)
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
        .setDescription(`已更新您的付款資訊\n\n收款人名稱: ${receiverName}\nPayMe URL: ${paymeURL}\nFPS: ${FPS}`);
    await interaction.reply({ embeds: [embed], ephemeral: true });
    logger.info(`Updated user ${interaction.user.id} with receiverName: ${receiverName}, paymeURL: ${paymeURL}, FPS: ${FPS}`);
};
