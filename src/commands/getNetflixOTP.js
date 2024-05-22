import { EmbedBuilder, SlashCommandBuilder, userMention } from "discord.js";
import { logger } from "../utils/logger.js";
import speakeasy from "speakeasy";

export const command = new SlashCommandBuilder().setName("getnetflixotp").setDescription("Get Netflix Email OTP for two factor authentication.");

export const action = async (ctx) => {
    const client = ctx.client;

    const user = ctx.user;
    const secret = process.env.NETFLIX_OTP_SECRET;

    const token = speakeasy.totp({
        secret: secret,
        encoding: "base32",
    });

    await ctx.reply({
        content: `Your Netflix OTP: ${token}`,
    });
};
