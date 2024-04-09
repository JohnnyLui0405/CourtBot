import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
export const mongoClient = new MongoClient(process.env.MONGO_TOKEN, {
    serverApi: ServerApiVersion.v1,
});

// if else
const dbName = process.env.NODE_ENV === "production" ? "CourtBot" : "CourtBotTest";
export const db = mongoClient.db(dbName);
