import { EmbedBuilder, SlashCommandBuilder, userMention, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

export const command = new SlashCommandBuilder()
    .setName("iq")
    .setDescription("test")
    .addMentionableOption((option) => option.setName("user").setDescription("User to test").setRequired(true))
    .addIntegerOption((option) => option.setName("iq").setDescription("IQ").setRequired(true));

export const action = async (ctx) => {
    const client = ctx.client;
    const userCollection = client.mongoClient.db("CourtBot").collection("IQTest");
    const iqCollection = client.mongoClient.db("CourtBot").collection("iq");

    const user = ctx.options.getMentionable("user");
    const iq = ctx.options.getInteger("iq");

    const result = await iqCollection.updateOne({ _id: user.id }, { $set: { username: user.displayName, IQ: iq } }, { upsert: true });

    console.log(result);

    // const result = await userCollection.find({}).toArray();

    // console.log(result);

    // result.forEach(async (element) => {
    //     try {
    //         const member = await ctx.guild.members.fetch(element._id.toString());

    //         if (member) {
    //             await iqCollection.updateOne({ _id: member.id }, { $set: { username: member.displayName, IQ: element.IQ } }, { upsert: true });
    //             // console.log(member.id);
    //         }
    //     } catch (error) {
    //         console.log(element._id.toString() + " not found");
    //         console.log(element.IQ);
    //     }
    // });
};
