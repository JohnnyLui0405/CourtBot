import { Events, EmbedBuilder, VoiceState, userMention } from "discord.js";
import { logger } from "../utils/logger.js";

const joinEmbed = (member, channel) => {
    return new EmbedBuilder()
        .setAuthor({
            name: member.displayName,
            iconURL: member.user.avatarURL(),
        })
        .setDescription(`${member} 跳進了語音頻道 ${channel}`)
        .setColor(0x44b37f)
        .setTimestamp(new Date());
};

const leaveEmbed = (member, channel) => {
    return new EmbedBuilder()
        .setAuthor({
            name: member.displayName,
            iconURL: member.user.avatarURL(),
        })
        .setDescription(`${member} 跳出了語音頻道 ${channel}`)
        .setColor(0xf04848)
        .setTimestamp(new Date());
};

const levelUpEmbed = (member, level) => {
    return new EmbedBuilder()
        .setAuthor({
            name: member.displayName,
            iconURL: member.user.avatarURL(),
        })
        .setDescription(`${member} 升級到了等級 ${level}`)
        .setColor(0x44b37f)
        .setTimestamp(new Date());
};

const levelUp = (level, voiceDuration) => {
    const requiredXp = Math.floor((++level / 0.7) ** 2);
    logger.debug("requiredXp: " + requiredXp + "");
    if (voiceDuration >= requiredXp) {
        const newLevel = Math.floor(0.7 * Math.sqrt(voiceDuration));
        return newLevel;
    }
    return -1;
};

export const event = {
    name: Events.VoiceStateUpdate,
};

/**
 *
 * @param {VoiceState} oldState
 * @param {VoiceState} newState
 */
export const action = async (oldState, newState) => {
    if (process.env.NODE_ENV === "development") return;
    const client = oldState.client;
    const config = client.config;

    oldState;
    // #region voice logging
    if (newState.member.bot) return;

    const recordChannel = await oldState.client.channels.fetch("748912260084400238");

    if (oldState.channel == null && newState.channel != null) {
        await recordChannel.send({
            embeds: [joinEmbed(newState.member, newState.channel)],
        });
    }

    if (oldState.channel != null && newState.channel == null) {
        await recordChannel.send({
            embeds: [leaveEmbed(oldState.member, oldState.channel)],
        });
    }

    if (oldState.channel != null && newState.channel != null) {
        if (oldState.channel.id != newState.channel.id) {
            await recordChannel.send({
                embeds: [leaveEmbed(oldState.member, oldState.channel)],
            });
            await recordChannel.send({
                embeds: [joinEmbed(newState.member, newState.channel)],
            });
        }
    }
    // #endregion

    // #region voice level
    if (oldState.channel == null && newState.channel != null) {
        const userCollection = client.db.collection("user");
        await userCollection.updateOne({ _id: newState.member.id }, { $set: { isVoiceChatting: true, lastJoinedDate: new Date() } }, { upsert: true });
    } else if (oldState.channel != null && newState.channel == null) {
        const userCollection = client.db.collection("user");
        const userData = await userCollection.findOne({ _id: newState.member.id });

        if (userData.isVoiceChatting) {
            const duration = Math.floor((new Date() - userData.lastJoinedDate) / 1000 / 60);
            logger.info("voice duration: " + duration + "");
            userData.voiceDuration += duration;
            logger.debug("voice duration: " + userData.voiceDuration + "");

            const newLevel = levelUp(userData.level, userData.voiceDuration);
            if (newLevel != -1) {
                await userCollection.updateOne({ _id: newState.member.id }, { $set: { isVoiceChatting: false, level: newLevel }, $inc: { voiceDuration: duration } });
                logger.info(`${newState.member.displayName}(${newState.member.id}) || level up to: ${newLevel} with voice duration increased: ${duration} minutes`);

                const levelUpChannel = await client.channels.fetch(config.levelUpNotiChannelId);
                await levelUpChannel.send({
                    content: userMention(newState.member.id),
                    embeds: [levelUpEmbed(newState.member, newLevel)],
                });
            } else {
                await userCollection.updateOne({ _id: newState.member.id }, { $set: { isVoiceChatting: false }, $inc: { voiceDuration: duration } });
                logger.info(`${newState.member.displayName}(${newState.member.id}) || voice duration increased: ${duration} minutes`);
            }
        }
    }
};
