import { Events, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionResponse, BaseInteraction } from "discord.js";
import { logger } from "../utils/logger.js";

export const event = {
    name: Events.InteractionCreate,
};

/**
 *
 * @param {BaseInteraction} interaction
 */
export const action = async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const client = interaction.client;
    const execute = client.commands.get(interaction.commandName);

    logger.info(`${interaction.member.displayName}(${interaction.member.id}) executing command ${interaction.commandName}`);

    await execute(interaction);
};
