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

    replyByChatId(chatId: string, reply: BotActions.Stage | BotActions.Option | string) {
        if (typeof reply === 'string') {
            this.bot.telegram.sendMessage(chatId, reply);
            return;
        }
        if (!reply.text) throw new Error("[reply.text] should be defined");

        
        const keyboard = Boolean(reply.options?.length) ? this._buildKeyboardByList(reply.options as BotActions.Option[]) : Markup.inlineKeyboard([{ text: 'Написать продавцу', callback_data: `selected ${reply.id}`}]);

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

    private _buildKeyboardByList(options: BotActions.Option[]): ExtraReplyMessage {
        const buttons: InlineKeyboardButton[] = options.map(option => ({
            text: option.text,
            callback_data: option.id
        }));
        return Markup.inlineKeyboard([buttons]);
    }
}
