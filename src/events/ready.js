import { Events } from "discord.js";
import fg from "fast-glob";
import { logger } from "../utils/logger.js";

export const event = {
    name: Events.ClientReady,
    once: true,
};

export const action = async (c) => {
    const files = await fg("./src/jobs/**.js");

    logger.info(`Loading ${files.length} jobs...`);
    for (const file of files) {
        const jobFile = await import("../../" + file);
        const job = await jobFile.action(c);
        job.start();
        logger.info(`Loaded job ${jobFile.job.name}`);
    }

    logger.info(`Ready! Logged in as ${c.user.tag}`);
};
