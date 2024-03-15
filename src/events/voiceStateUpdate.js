import { Events, VoiceState, EmbedBuilder } from "discord.js";
import discord from "discord.js";

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

export const event = {
    name: Events.VoiceStateUpdate,
};

export const action = async (oldState, newState) => {
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
};
