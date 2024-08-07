import { BaseInteraction, ButtonBuilder, EmbedBuilder, ActionRowBuilder, SlashCommandBuilder, userMention, ButtonStyle } from "discord.js";
import { logger } from "../utils/logger.js";

export const command = new SlashCommandBuilder()
    .setName("更新生日")
    .setDescription("新增/更新生日")
    .addStringOption((option) => option.setName("date").setDescription("生日日期 YYYY-MM-DD").setRequired(true))
    .addUserOption((option) => option.setName("user").setDescription("使用者").setRequired(false));

/**
 *
 * @param {BaseInteraction} ctx
 */
export const action = async (ctx) => {
    const client = ctx.client;
    const userCollection = client.db.collection("user");

    const date = new Date(ctx.options.getString("date"));
    // get duedate by adding the number of days to the current date
    const createdDate = new Date();
    const user = ctx.options.getUser("user") || ctx.user;
    if (user.id !== ctx.user.id && !(ctx.user.id == "334534960654450690")) {
        await ctx.reply("抱歉，您沒有權限為他人使用此指令", { ephemeral: true });
        return;
    }
    const inserted = await userCollection.updateOne({ _id: user.id }, { $set: { birthday: date } }, { upsert: true });

    logger.info(`${ctx.user.displayName}(${ctx.user.id}) added date of birth | Date: ${date.toLocaleDateString()} | Created Date: ${createdDate.toLocaleDateString()}`);

    const embed = new EmbedBuilder()
        .setTitle("生日新增成功")
        .setColor(0x33ccff)
        .setFields({ name: "使用者", value: userMention(user.id) }, { name: "生日日期", value: date.toLocaleDateString() }, { name: "新增日期", value: createdDate.toLocaleDateString() })
        .setFooter({ text: "感謝您使用服務！" })
        .setTimestamp(new Date());

    await ctx.reply({ embeds: [embed] });
};
