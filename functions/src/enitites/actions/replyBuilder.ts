import { Markup, Telegraf } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { BotActions } from "../../types/action";
import { MESSAGES } from "../../utils/defaults";

export default class BotReplyBuilder {
    bot: Telegraf

    constructor(bot: Telegraf) {
        this.bot = bot;
    }

    default(chatId: string, message: string = MESSAGES.DEFAULT_MSG, commands: string[] = []): void {
        this.bot.telegram.sendMessage(chatId, `${message}:\n${commands.join('\n')}`);
    }

    replyByChatId(chatId: string, reply: BotActions.Stage | string) {
        if (typeof reply === 'string') {
            this.bot.telegram.sendMessage(chatId, reply);
            return;
        }
        if (!reply.text) throw new Error("[reply.text] should be defined");

        
        const inlineKeyboard = Boolean(reply.options?.length) ? this._buildKeyboardByList(reply.options as BotActions.Option[], true) : {};
        const replyKeyboard = Boolean(reply.tips?.length) ? this._buildKeyboardByList(reply.tips as BotActions.Tip[]) : {};
        const keyboard = Object.assign({}, inlineKeyboard, replyKeyboard);

        if (reply.picture) {
            const extra = {
                ...keyboard,
                caption: reply.text
            }
            this.bot.telegram.sendPhoto(chatId, reply.picture, extra)
        } else {
            this.bot.telegram.sendMessage(chatId, reply.text, keyboard);
        };
    }

    private _buildKeyboardByList(options: BotActions.Option[] | BotActions.Tip[], isInline: boolean = false): ExtraReplyMessage {
        if (isInline) {
            return Markup.inlineKeyboard([options as InlineKeyboardButton[]]);
        } else {
            return Markup.keyboard([options]).oneTime().resize();
        }
    }
}
