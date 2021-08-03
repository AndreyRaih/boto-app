import { Telegraf } from "telegraf";
import { Bot } from "../../../types/bot";
import { MESSAGES } from "../../../utils/defaults";
import BotReplyBuilder from "../replyBuilder";

export default class BotRegistrationExecutor {
    bot: Telegraf;
    botData: Bot.IBot;

    constructor(bot: Telegraf, botData: Bot.IBot) {
        this.bot = bot;
        this.botData = botData;
    }

    run(): void {
        this.bot.start((ctx: any) => {
            const chatId = ctx.message.chat.id;
            const hasSubscriber = this.botData.subscribers.some(subscriber => subscriber.id === chatId);
            if (!hasSubscriber) return this._runRegistrationForm(chatId);
            return this._resetSubscriberData(chatId);
        })
    }

    executeRegistration() {
        this.bot.on('message', (ctx: any) => {
            const chatId = ctx.message.chat.id;
            const data = ctx.message.text;
            const subscriber = this.botData.subscribers.find(({id}) => id === chatId);
            if (!Boolean(subscriber?.contactData?.name)) {
                this.botData.updateSubscriberData(chatId, { contactData: { ...subscriber?.contactData as Bot.ContactData, name: data }})
                new BotReplyBuilder(this.bot).replyByChatId(chatId, MESSAGES.REGISTRATION.FIRST_STEP);
                return;
            }
            if (!Boolean(subscriber?.contactData?.phone)) {
                this.botData.updateSubscriberData(chatId, { contactData: { ...subscriber?.contactData as Bot.ContactData, phone: data }})
                new BotReplyBuilder(this.bot).replyByChatId(chatId, MESSAGES.REGISTRATION.SECOND_STEP);
                return;
            }
            if (!Boolean(subscriber?.contactData?.adress)) {
                this.botData.updateSubscriberData(chatId, { contactData: { ...subscriber?.contactData as Bot.ContactData, adress: data, }, registrationInProgress: false })
                new BotReplyBuilder(this.bot).replyByChatId(chatId, MESSAGES.REGISTRATION.THIRD_STEP);
                return;
            }
        })
    }

    private async _runRegistrationForm(id: string) {
        await this.botData.setSubscriber(id);
        this.botData.updateSubscriberData(id, { registrationInProgress: true, contactData: { name: null, phone: null, adress: null } })
        new BotReplyBuilder(this.bot).replyByChatId(id, MESSAGES.START_FIRST_MSG);
    }

    private _resetSubscriberData(id: string) {
        new BotReplyBuilder(this.bot).replyByChatId(id, MESSAGES.START_MSG);
    }
}