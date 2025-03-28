import { REST, Routes, Collection } from "discord.js";
import fg from "fast-glob";
import { logger } from "../utils/logger.js";

const updateSlashCommands = async (commands) => {
    const token = process.env.NODE_ENV === "production" ? process.env.TOKEN : process.env.DEV_TOKEN;
    const applicationId = process.env.NODE_ENV === "production" ? process.env.APPLICATION_ID : process.env.DEV_APPLICATION_ID;
    const rest = new REST({ version: 10 }).setToken(token);
    for (const guildId of ["736602050024177665", "1216257889988251798", "1343227084042010625"]) {
        await rest.put(Routes.applicationGuildCommands(applicationId, guildId), {
            body: commands,
        });
    }
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
