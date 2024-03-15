import { Events, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export const event = {
    name: Events.InteractionCreate,
};

export const action = async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const client = interaction.client;
    const action = client.commands.get(interaction.commandName);

    await action(interaction);
};
