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
                role: "user",
                content: message.content,
            },
        ],
        max_tokens: 500,
    });
    console.log(completion);
    await message.reply(completion.choices[0].message.content);
};
