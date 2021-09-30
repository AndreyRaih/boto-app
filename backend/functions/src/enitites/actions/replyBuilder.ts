import { _onRequestWithOptions } from "firebase-functions/lib/providers/https";
import { Markup, Telegraf } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { BotActions } from "../../types/action";

export default class BotReplyBuilder {
    bot: Telegraf

    constructor(bot: Telegraf) {
        this.bot = bot;
    }

    replyByChatId(chatId: string, reply: BotActions.Stage | string) {
        if (typeof reply === 'string') {
            this.bot.telegram.sendMessage(chatId, reply);
            return;
        }

        if (!reply.text) throw new Error("[reply.text] should be defined");
        
        const hasKeyboard: boolean = Boolean((reply.triggers as BotActions.Trigger[]).length);
        const keyboard: ExtraReplyMessage = hasKeyboard ? this._buildKeyboardByList(reply.triggers as BotActions.Trigger[]) : {};

        if (reply.images.length) {
            this.bot.telegram.sendMediaGroup(chatId, reply.images.map(image => ({ type: 'photo', media: image, caption: reply.text })), keyboard);
        } else {
            this.bot.telegram.sendMessage(chatId, reply.text, keyboard);
        };
        return {
            date: Date.now(),
            text: reply.text,
            event: null,
            isBot: true
        }
    }

    private _buildKeyboardByList(triggers: BotActions.Trigger[]): ExtraReplyMessage {
        const inlineButtons: InlineKeyboardButton[] = triggers.filter(({ type }) => type === 'button').map(trigger => ({
            text: trigger.text as string,
            callback_data: trigger.id as string
        }));
        const inputHints = triggers.filter(({ type, inputNeedMatch }) => type === 'input' && inputNeedMatch).map(trigger => ({
            text: trigger.matchString as string
        }));
        return { reply_markup: { ...Markup.inlineKeyboard([inlineButtons]).reply_markup, ...Markup.keyboard([inputHints]).reply_markup } };
    }
}
