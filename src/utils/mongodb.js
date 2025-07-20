import { MongoClient, ServerApiVersion } from "mongodb";
import { logger } from "./logger.js";
import dotenv from "dotenv";
dotenv.config();
export const mongoClient = new MongoClient(process.env.MONGO_TOKEN, {
    serverApi: ServerApiVersion.v1,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
});

// if else
const dbName = process.env.NODE_ENV === "production" ? "CourtBot" : "CourtBotTest";
export const db = mongoClient.db(dbName);

mongoClient.on("error", (error) => {
    logger.error("MongoDB connection error:", error);
});
