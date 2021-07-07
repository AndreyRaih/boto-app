import { Context, Markup, Telegraf } from "telegraf";
import { InlineKeyboardButton, KeyboardButton } from "telegraf/typings/core/types/typegram";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { BotActions } from "../../types/action";

export default class BotActionExecutor implements BotActions.IExecutor {
    bot: Telegraf;
    action: BotActions.Action;

    constructor(bot: Telegraf, action: BotActions.Action) {
        this.bot = bot;
        this.action = action;
    };

    execute(currentStep: number = 0): Promise<{ id: string, step: number }> {
        return new Promise((resolve, reject) => {
            if (!this.action?.stages) throw reject(new Error("[action.stages] is required"));

            const hasAction: boolean = Boolean(this.action?.stages[currentStep]);
            if (!hasAction) currentStep = 0;

            const action = this.action.stages[currentStep]

            this.bot.on("message", (ctx: any) => {
                this._handleReply(action as BotActions.Reply, ctx);
                resolve({ 
                    id: ctx.message.chat.id.toString(),
                    step: currentStep + 1
                })
            })
        });
    }

    private _handleReply(reply: BotActions.Reply, ctx: Context) {
        const keyboard = reply.keyboard ? this._handleInlineQuery(reply.keyboard) : {};
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

    private _handleInlineQuery(keyboardConfig: BotActions.Reply.Keyboard): ExtraReplyMessage {
        if (keyboardConfig.isInline) {
            return Markup.inlineKeyboard([ keyboardConfig.buttons as InlineKeyboardButton[] ]);
        } else {
            return Markup.keyboard([ keyboardConfig.buttons as KeyboardButton[] ]);
        }
    }
}