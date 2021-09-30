import { Telegraf } from "telegraf";
import { Bot } from "../../../types/bot";
import { MESSAGES } from "../../../utils/defaults";
import BotReplyBuilder from "../replyBuilder";


export class BotRegistrationExecutor {
    telegraf: Telegraf;
    contactData: Bot.ContactData;

    constructor(telegraf: Telegraf, contactData: Bot.ContactData) {
        this.telegraf = telegraf;
        this.contactData = contactData;
    }

    get step() {
        if (!this.contactData.phone) return 0;
        if (!this.contactData.name) return 1;
        if (!this.contactData.address) return 2;
        return null;
    }

    execute() {
        return new Promise((resolve, reject) => this.telegraf.on('message', (ctx: any) => {
            const chatId = ctx.message.chat.id;
            const data = ctx.message.text;
            switch(this.step) {
                case 0:
                    new BotReplyBuilder(this.telegraf).replyByChatId(chatId, MESSAGES.REGISTRATION.FIRST_STEP)
                    return resolve({ name: data });
                case 1:
                    new BotReplyBuilder(this.telegraf).replyByChatId(chatId, MESSAGES.REGISTRATION.SECOND_STEP)
                    return resolve({ phone: data });
                case 2: 
                    new BotReplyBuilder(this.telegraf).replyByChatId(chatId, MESSAGES.REGISTRATION.THIRD_STEP)
                    return resolve({ address: data });
                default: reject(new Error("wrong [contactData] object"));
            }
        }))
    }
}