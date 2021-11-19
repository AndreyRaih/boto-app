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
            this.bot.telegram.sendMessage(chatId, reply, {parse_mode: 'HTML'});
            return;
        }

        if (!reply.text) reply.text = '...';
        
        const isLastMsg: boolean = !Boolean((reply.triggers as BotActions.Trigger[]).length);
        const keyboard: ExtraReplyMessage = !isLastMsg ? this._buildKeyboardByList(reply.triggers as BotActions.Trigger[]) : {};

        if (isLastMsg) reply.text = `${reply.text}\n\nДля возвращения к началу беседы отправьте команду: /start`

        if (reply.media && reply.media.length) {
            if (reply.media.length === 1) {
                const media = reply.media[0] as any;
                if (media.type === 'image') {
                    this.bot.telegram.sendPhoto(chatId, reply.media[0].url, {...keyboard, caption: reply.text });
                } 
                if (media.type === 'video') {
                    this.bot.telegram.sendVideo(chatId, reply.media[0].url, {...keyboard, caption: reply.text });
                }
            } else {
                const media = reply.media.map(({ type, url }) => ({ type: type === 'image' ? 'photo' : 'video', media: url })) as any[];
                await this.bot.telegram.sendMediaGroup(chatId, media);
                this.bot.telegram.sendMessage(chatId, reply.text, {...keyboard, parse_mode: 'HTML' });
            }
        } else {
            this.bot.telegram.sendMessage(chatId, reply.text, {...keyboard, parse_mode: 'HTML' });
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
