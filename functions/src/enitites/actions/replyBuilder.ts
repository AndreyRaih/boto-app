import { Context, Markup, Telegraf } from "telegraf";
import { InlineKeyboardButton, KeyboardButton } from "telegraf/typings/core/types/typegram";
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
            this.bot.command(action.trigger, async (ctx: Context) => {
                if (!action.stages?.length) throw reject(new Error("[action.stages] should be defined and contain at least one elem"));

                if (action.greetingMessage) ctx.reply(action.greetingMessage);

                this._handleReply((action.stages as BotActions.Reply[])[0], ctx);
                resolve();
            })
        });
    }

    default(message: string = DEFAULT_MESSAGE, commands: string[] = []): void {
        this.bot.on("text", ctx => ctx.reply(`${message} ${commands}`));
    }

    stage(action: BotActions.Reply): Promise<BotActions.Progress.Data> {
        switch (action.type) {
            case "INPUT":
                return this._buildInputAction(action);
            case "SELECT":
                return this._buildSelectAction(action);
            default:
                throw new Error("action should be defined as FORM or SELECT");
        }
    }

    private  _buildInputAction(action: BotActions.Reply): Promise<BotActions.Progress.Data> {
        return new Promise((resolve) => this.bot.on("message", (ctx: any) => {
            this._handleReply(action as BotActions.Reply, ctx);
            resolve({
                step: action.step + 1,
                value: ctx.message?.text
            })
        }));
    }

    private _buildSelectAction(action: BotActions.Reply): Promise<BotActions.Progress.Data> {
        return new Promise((resolve, reject) => {
            if (!action.options) throw reject(new Error("[action.options] should be defined and contain at least one elem"));

            switch (action.optionsAppearance) {
                case "BUTTON":
                    this.bot.action(/.+/, async (ctx: any) => {
                        await ctx.answerCbQuery(`Oh, ${ctx.match[0]}! Great choice`);
                        resolve({
                            step: action.step + 1,
                            value: ctx.match[0]
                        })
                    })
                    break;
                case "KEYBOARD":
                    action.options.forEach(option => this.bot.hears(option.text, async (ctx: any) => {
                        ctx.reply(`Oh, ${ctx.message?.text}! Great choice`);
                        resolve({
                            step: action.step + 1,
                            value: ctx.message?.text
                        })
                    }));
                    break;
                default:
                    break;
            }

            this.bot.on("message", (ctx: Context) => this._handleReply(action as BotActions.Reply, ctx))
        });
    }

    private _handleReply(reply: BotActions.Reply, ctx: Context) {
        if (!reply.text) throw new Error("[reply.text] should be defined");
        
        const keyboard = Boolean(reply.options?.length) ? this._buildKeyboardByOptions(reply.options || [], reply.optionsAppearance) : {};
        if (reply.picture) {
            const extra = {
                ...keyboard,
                caption: reply.text
            }
            ctx.replyWithPhoto(reply.picture, extra)
        } else {
            ctx.reply(reply.text, keyboard);
        };
    }

    private _buildKeyboardByOptions(options: BotActions.Option[], appearance?: string): ExtraReplyMessage {
        const buttons: InlineKeyboardButton[] | KeyboardButton[] = options.map(option => Object.assign({}, 
            { text: option.text },
            appearance === 'BUTTON' && { callback_data: option.value }
        ))
        switch (appearance) {
            case "BUTTON":
                return Markup.inlineKeyboard([buttons as InlineKeyboardButton[]]);
            case "KEYBOARD":
                return Markup.keyboard([buttons]).oneTime().resize();
            default:
                return Markup.inlineKeyboard([buttons as InlineKeyboardButton[]]);
        }
    }
}
