import dotenv from "dotenv";
dotenv.config();
import { Client, EmbedBuilder, Events, GatewayIntentBits } from "discord.js";
import { loadCommands, loadEvents } from "./core/loader.js";
import { mongoClient, db } from "./utils/mongodb.js";
import { logger } from "./utils/logger.js";
import { config } from "./utils/config.js";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
    ],
});

loadEvents(client);

loadCommands(client);

client.mongoClient = mongoClient;
client.db = db;
client.config = config;
client.mongoClient.connect().then(() => {
    logger.info("Connected to MongoDB");
});
client.mainEmbedBuilder = () => {
    return new EmbedBuilder().setFooter({ text: "Court Bot" }).setTimestamp(new Date()).setColor(0x33ccff);
};
client.debtEmbedBuilder = () => {
    return new EmbedBuilder().setFooter({ text: "追債服務助理" }).setTimestamp(new Date()).setColor(0x33ccff);
};
const token = process.env.NODE_ENV === "production" ? process.env.TOKEN : process.env.DEV_TOKEN;
client.login(token);
