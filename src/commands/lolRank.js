import { SlashCommandBuilder } from "discord.js";
import axios from "axios";
import { logger } from "../utils/logger.js";

export const command = new SlashCommandBuilder()
    .setName("lolstats")
    .setDescription("get user stats from LOL API")
    .addStringOption((option) => option.setName("username").setDescription("Username#TAG e.g 即棄工具人#TW2").setRequired(true));

export const action = async (ctx) => {
    const client = ctx.client;

    const username = ctx.options.getString("username").split("#")[0];
    const tag = ctx.options.getString("username").split("#")[1];

    const accountRespond = await axios.get(`https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${username}/${tag}?api_key=${process.env.RIOT_API_KEY}`);

    const puuid = accountRespond.data.puuid;
    logger.debug(puuid);

    logger.debug(`https://tw2.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${process.env.RIOT_API_KEY}`);
    const summonerRespond = await axios.get(`https://tw2.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${process.env.RIOT_API_KEY}`);
    const summonerId = summonerRespond.data.id;
    logger.debug(summonerId);

    const leagueRespond = await axios.get(`https://tw2.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${process.env.RIOT_API_KEY}`);
    logger.debug(JSON.stringify(leagueRespond.data));

    await ctx.reply({ content: JSON.stringify(leagueRespond.data) });
};
