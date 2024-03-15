import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { useAppStore } from "@/store/app";

export const command = new SlashCommandBuilder()
    .setName("sendinfo")
    .setDescription("Send info message");

export const action = async (ctx) => {
    const appStore = useAppStore();
    const mongoClient = appStore.mongoClient;
    const japanCollection = mongoClient.db("CourtBot").collection("Japan");

    const memberList = await japanCollection.find({}).toArray();
    await ctx.guild.members.fetch();
    const admin = await ctx.guild.members.fetch("334534960654450690");
    const memberUpdatedList = ["465537181423763456", "325855613907369984"];
    for (const memberInfo of memberList) {
        if (!memberUpdatedList.includes(memberInfo._id)) {
            continue;
        }
        const member = await ctx.guild.members.fetch(memberInfo["_id"]);
        // console.log(memberInfo);
        var money = memberInfo["notPaid"] - memberInfo["refund"];
        money += 211.2;
        money = Math.round(money * 100) / 100;
        // const infoConfirmationText = `資料確認\n姓氏: ${memberInfo["lastName"]}\n名字: ${memberInfo["firstName"]}\n身份證: ${memberInfo["HKID"]}\n生日日期: ${memberInfo["birthday"]}`;
        const moneyText = `原來阿V已經退左款 更新個金額\n\n此金額包括保險$211.2, 住宿$1500 及機票/住宿退款\n應付金額：$${memberInfo["notPaid"]} + $211.2\n退款金額：$${memberInfo["refund"]}\n總金額：$${money}`;
        const paymethodText = `如以上資料無誤可透過以下方式付款\nFPS/Payme: 93127608\nLUI CXXX SXXXX\nHKD$ ${money}\n請盡量於本月底前完成付款`;
        const message = moneyText + "\n\n" + paymethodText;
        await member.send(message);
        console.log(message);
    }
};
