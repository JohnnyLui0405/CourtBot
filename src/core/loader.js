import { REST, Routes, Collection } from "discord.js";
import fg from "fast-glob";
import { logger } from "../utils/logger.js";

const updateSlashCommands = async (commands) => {
    const rest = new REST({ version: 10 }).setToken(process.env.TOKEN);
    await rest.put(Routes.applicationGuildCommands(process.env.APPLICATION_ID, "736602050024177665"), {
        body: commands,
    });
};

export const loadCommands = async (client) => {
    logger.info("Loading commands...");
    const commands = [];
    client.commands = new Collection();
    const files = await fg("./src/commands/**.js");

    for (const file of files) {
        const cmd = await import("../../" + file);
        commands.push(cmd.command);
        client.commands.set(cmd.command.name, cmd.action);
        logger.info(`Loaded command ${cmd.command.name}`);
    }

    await updateSlashCommands(commands);
};

export const loadEvents = async (client) => {
    logger.info("Loading events...");
    const files = await fg("./src/events/**.js");
    for (const file of files) {
        const eventFile = await import("../../" + file);
        if (eventFile.event.once) {
            client.once(eventFile.event.name, eventFile.action);
        } else {
            client.on(eventFile.event.name, eventFile.action);
        }
        logger.info(`Loaded event ${eventFile.event.name}`);
    }
};
