import { Telegraf } from "telegraf";
import { Bot } from "../../../types/bot";
import { MESSAGES } from "../../../utils/defaults";
import BotReplyBuilder from "../replyBuilder";

const SEND_MESSAGE_TO_SUBSCRIBERS = '/send_post';
const PAUSE_MESSAGES_BY_CHAT_ID = '/pause';

export default class BotSystemCommandsExecutor {
    bot: Telegraf;
    botData: Bot.IBot;

    constructor(bot: Telegraf, botData: Bot.IBot) {
        this.bot = bot;
        this.botData = botData;
    }

    run(): void {
        this.bot.hears(SEND_MESSAGE_TO_SUBSCRIBERS, (ctx: any) => this._executeSendingMsg(ctx.message.chat.id));

        this.bot.hears(PAUSE_MESSAGES_BY_CHAT_ID, (ctx: any) => this._executePauseByChatId(ctx.message.chat.id));
    }

    private _executeSendingMsg(chatId: string) {
        const isAdmin = this.botData.admins.some(({ id }) => chatId === id);
        if (isAdmin) {
            this.botData.updateAdminData(chatId, { sendingMessageInProgress: true })
            new BotReplyBuilder(this.bot).replyByChatId(chatId, MESSAGES.SENDING_MSG)
        }
    }

    private _executePauseByChatId(chatId: string) {
        this.botData.updateSubscriberData(chatId, { isPaused: true });
        new BotReplyBuilder(this.bot).replyByChatId(chatId, MESSAGES.PAUSE_MSG)
    }
}