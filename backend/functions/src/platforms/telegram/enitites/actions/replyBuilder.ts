import { _onRequestWithOptions } from "firebase-functions/lib/providers/https";
import { Markup, Telegraf } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { BotActions } from "../../../../types/action";

export default class BotReplyBuilder {
    bot: Telegraf

    constructor(bot: Telegraf) {
        this.bot = bot;
    }

    async replyByChatId(chatId: string, reply: BotActions.Stage | string) {
        if (typeof reply === 'string') {
            this.bot.telegram.sendMessage(chatId, reply);
            return;
        }

        if (!reply.text) reply.text = '...';
        
        const isLastMsg: boolean = !Boolean((reply.triggers as BotActions.Trigger[]).length);
        const keyboard: ExtraReplyMessage = !isLastMsg ? this._buildKeyboardByList(reply.triggers as BotActions.Trigger[]) : {};

        if (isLastMsg) reply.text = `${reply.text}\n\nДля возвращения к началу беседы отправьте команду: /start`

        if (reply.images && reply.images.length) {
            if (reply.images.length === 1) {
                this.bot.telegram.sendPhoto(chatId, reply.images[0], {...keyboard, caption: reply.text });
            } else {
                await this.bot.telegram.sendMediaGroup(chatId, reply.images.map(image => ({ type: 'photo', media: image })));
                this.bot.telegram.sendMessage(chatId, reply.text, keyboard);
            }
        } else {
            this.bot.telegram.sendMessage(chatId, reply.text, keyboard);
        };
        return {
            date: Date.now(),
            text: reply.text,
            event: null,
            isBot: true,
            isLastMsg
        }
    }

    private _buildKeyboardByList(triggers: BotActions.Trigger[]): ExtraReplyMessage {
        const inlineButtons: InlineKeyboardButton[][] = triggers.map(trigger => ([{
            text: trigger.text as string,
            callback_data: trigger.destinationId as string
        }]));
        return { reply_markup: { ...Markup.inlineKeyboard(inlineButtons).reply_markup } };
    }
}
