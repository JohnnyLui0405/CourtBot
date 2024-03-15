import { CronJob } from "cron";
import { useAppStore } from "@/store/app";

export const job = async (client) => {
  return new CronJob("0 * * * *", async () => {
    const appStore = useAppStore();
    const mongoClient = appStore.mongoClient;
    const japanCollection = mongoClient.db("CourtBot").collection("Japan");
    const guild = await client.guilds.fetch("736602050024177665");
    const role = await guild.roles.fetch("1063701843164803134");

    const submitters = await japanCollection.distinct("_id");
    submitters.push("418033425723686912");

    await guild.members.fetch();

    const text = await role.members
      .filter((member) => !submitters.includes(member.id))
      .toJSON()
      .join(" ");

    const msg = await (
      await guild.channels.fetch("1080351928023797801")
    ).send(text);

    console.log(text);

    await msg.delete();
  });
};
