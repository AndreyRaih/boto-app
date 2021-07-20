import { Context, Markup, Telegraf } from "telegraf";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { BotActions } from "../../types/action";

const DEFAULT_MESSAGE: string = 'Commands:';

export default class BotReplyBuilder {
    bot: Telegraf

    constructor(bot: Telegraf) {
        this.bot = bot;
    }

    command(action: BotActions.Action): Promise<void> {
        return new Promise((resolve, reject) => {
            this.bot.command(action.trigger, (ctx: Context) => {
                if (!action.stages?.length) throw reject(new Error("[action.stages] should be defined and contain at least one elem"));
                if (action.greetingMessage) ctx.reply(action.greetingMessage);
                resolve();
            })
        });
    }

    default(message: string = DEFAULT_MESSAGE, commands: string[] = []): void {
        this.bot.on("text", ctx => ctx.reply(`${message} ${commands}`));
    }

    async stage(chatId: string, action: BotActions.Reply, type: BotActions.Action.Type): Promise<BotActions.Progress.Data> {
        this._sendNextStage(chatId, action);
        
        const value = await this._buildReplyByType(action, type);
        return {
            step: action.step,
            description: action.description,
            value
        };
    }

    private _buildReplyByType(action: BotActions.Reply, type: BotActions.Action.Type): Promise<string> {
        switch (type) {
            case "INPUT":
                return this._buildInputAction(action);
            case "SELECT":
                return this._buildSelectAction(action);
            case "SUBSCRIBE":
                return this._buildSubsribeAction(action);
            default:
                throw new Error("action should be defined as FORM or SELECT or SUBSRIBE");
        }
    }

    private  _buildInputAction(action: BotActions.Reply): Promise<string> {
        return new Promise((resolve) => this.bot.on("message", (ctx: any) => resolve(ctx.message?.text)));
    }

    private _buildSelectAction(action: BotActions.Reply): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!action.options) throw reject(new Error("[action.options] should be defined and contain at least one elem"));

            this.bot.action(/.+/, async (ctx: any) => {
                await ctx.answerCbQuery(`Oh, ${ctx.match[0]}! Great choice`);
                resolve(ctx.match[0])
            });
        });
    }

    private _buildSubsribeAction(action: BotActions.Reply): Promise<string> {
        return Promise.resolve('');
    }

    private _sendNextStage(chatId: string, reply: BotActions.Reply) {
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
