import OpenAI from "openai";
import { configDotenv } from "dotenv";
configDotenv();

export const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPEN_ROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": "https://6yeah.cc",
        "X-Title": "6yeah",
    },
});
