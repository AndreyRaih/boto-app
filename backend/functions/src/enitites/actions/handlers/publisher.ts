import { Telegraf } from "telegraf";
import { Bot } from "../../../types/bot";
import { BotInteraction } from "../../../types/interaction";
import BotReplyBuilder from "../replyBuilder";

export default class BotPostPublisher implements BotInteraction.IPublisher {
    bot: Telegraf;
    botData: Bot.IBot;

    constructor(bot: Telegraf, botData: Bot.IBot) {
        this.bot = bot;
        this.botData = botData;
    }
    publishPost(): void {
        this.bot.on("message", async (ctx: any) => {
            this.botData.subscribers.filter(({ isPaused }) => Boolean(isPaused)).forEach(({ id }) => new BotReplyBuilder(this.bot).replyByChatId(id, ctx.message?.text))
            this.botData.updateAdminData(ctx.message.chat.id, { sendingMessageInProgress: false })
        })
    }
}