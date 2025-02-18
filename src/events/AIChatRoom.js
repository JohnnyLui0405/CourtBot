import { Events } from "discord.js";
import { logger } from "../utils/logger.js";

export const event = {
    name: Events.MessageCreate,
};

/**
 *
 * @param {Message} message
 */
export const action = async (message) => {
    const client = message.client;
    const aiChatChannelId = client.config.aiChatChannelId;
    if (message.author.bot) return;
    if (!Object.keys(aiChatChannelId).includes(message.channel.id)) return;

    await message.channel.sendTyping();
    const content_prefix = "Please answer the following question 2000 or fewer in length .\n";
    const model = client.config.aiChatChannelId[message.channel.id];
    const completion = await client.openai.chat.completions.create({
        model: aiChatChannelId[message.channel.id],
        messages: [
            {
                role: "system",
                content:
                    "DeepSeek, please provide concise responses, focusing on the main points without unnecessary details. Ensure clarity and structure your answer to address the key aspects of the query. Keep your response under 1800 characters.",
            },
            {
                role: "user",
                content: message.content,
            },
        ],
        max_tokens: 500,
    });
    await message.reply(completion.choices[0].message.content);
};
