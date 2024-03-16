import dotenv from "dotenv";
dotenv.config();
import { Client, Events, GatewayIntentBits } from "discord.js";
import { loadCommands, loadEvents } from "./core/loader.js";
import { mongoClient } from "./utils/mongodb.js";
import { logger } from "./utils/logger.js";

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates],
});

loadEvents(client);

loadCommands(client);

client.mongoClient = mongoClient;

client.mongoClient.connect().then(() => {
    logger.info("Connected to MongoDB");
});

client.login(process.env.TOKEN);
