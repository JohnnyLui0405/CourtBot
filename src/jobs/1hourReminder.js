import { CronJob } from "cron";
import { logger } from "../utils/logger.js";
import { Client } from "discord.js";

export const job = {
    name: "1hourReminder",
};

/**
 *
 * @param {Client} client
 * @returns
 */
export const action = async (client) => {
    return new CronJob("0 * * * *", async () => {
        logger.info(`Running ${job.name} job...`);
        const user = await client.users.fetch("382709371769192449");
        await user.send({
            content: `<@382709371769192449>\nBook政府醫院門診`,
        });
        // const develop = await client.users.fetch("334534960654450690");
        // await develop.send({
        //     content: `<@334534960654450690>`,
        // });
        logger.info(`${job.name} job Done!`);
    });
};
