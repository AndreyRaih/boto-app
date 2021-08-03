import { Telegraf } from "telegraf";
import { BotActions } from "../../../types/action";
import { Bot } from "../../../types/bot";
import { BotInteraction } from "../../../types/interaction";
import { MESSAGES } from "../../../utils/defaults";
import BotReplyBuilder from "../replyBuilder";

export default class BotActionExecutor implements BotInteraction.IExecutor {
    bot: Telegraf;
    botData: Bot.IBot;
    chatId: string;
    progress: BotActions.Progress | undefined;
    actions: BotActions.Action[];

    constructor(bot: Telegraf, data: Bot.IBot, chatId: string, actions: BotActions.Action[] = [], progress: BotActions.Progress | undefined) {
        this.bot = bot;
        this.botData = data;
        this.chatId = chatId;
        this.actions = actions;
        this.progress = progress;
    };

    get currentAction() {
        return this.actions[0];
    }

    get currentStage() {
        return (this.currentAction?.options as BotActions.Stage[])[0];
    }

    get previousBreadcrumbs() {
        return this.progress?.select?.breadcrumbs || [];
    }

    get options() {
        const flat = (list: any[]): BotActions.Option[] => list.reduce((acc, val) => acc.concat(val, Array.isArray(val.options) && flat(val.options)), [])
        return this.currentStage.options ? flat(this.currentStage.options) : []
    }

    async runAction(): Promise<BotActions.Update>{
        return new Promise((resolve) => {
            this.bot.on("message", async (ctx: any) => {
                const id = ctx.message?.text;
                if (this.currentAction.trigger !== id) return this._replyWithDefaultMsg();
                this._replyWithOptions(this.currentStage)
                return resolve({
                    finish: false,
                    data: {
                        id,
                        history: [],
                        inputs: [],
                        select: null
                    }
                });
            })
        });
    }

    executeAction(): Promise<BotActions.Update>{
        return new Promise((resolve) => {
            const select = (isCategory: boolean, messageId: string, value: string) => resolve({
                finish: !isCategory,
                data: {
                    id: this.currentAction?.trigger,
                    history: [...this.progress?.history as string[], messageId],
                    select: {
                        breadcrumbs: isCategory ? [...this.previousBreadcrumbs, value] : this.previousBreadcrumbs,
                        description: 'Пользователь выбрал',
                        value: isCategory ? null : value
                    }
                }
            });

            this.bot.action(/.+/, async (ctx: any) => {
                const value = ctx.match[0];
                const valueParts = value.split(' ');
                const isSelect = valueParts[0] === 'selected';
                const isBack = value === 'back';

                if (isSelect) {
                    this._cleanAndSendFinalMsg(ctx.update.callback_query.message.message_id.toString())
                    select(false, ctx.update.callback_query.message.message_id.toString(), valueParts[1])
                }

                if (isBack) {
                    this.bot.telegram.deleteMessage(this.chatId, ctx.update.callback_query.message.message_id)
                }

                await ctx.answerCbQuery(`О, ${value}! Отличный выбор!`);
                const option = this.options.find(option => option.id === value);
                if (option) this._replyWithOptions(option);
                select(true, ctx.update.callback_query.message.message_id.toString(), value)
            });
        })
    }

    async finishAction(progress: BotActions.Progress): Promise<void> {
        const { contactData } = this.botData.subscribers.find(({ id }) => this.chatId === id) as Bot.User;
        const resultMsg = 
            `Пользователь ${contactData?.name}, завершил(а) завершила действие с результатом:
        ${progress?.select?.description}: ${progress?.select?.value}
        
        Контактная информация:
        Имя: ${contactData?.name}
        Телефон: ${contactData?.phone}
        Адрес: ${contactData?.adress}`
        this.botData.admins.forEach(({ id }) => new BotReplyBuilder(this.bot).replyByChatId(id, resultMsg))
    }

    private _cleanAndSendFinalMsg(messageId: string): void {
        [...this.progress?.history as string[], messageId].forEach(item => this.bot.telegram.deleteMessage(this.chatId, parseInt(item)));
        new BotReplyBuilder(this.bot).replyByChatId(this.chatId, 'Продавец свяжется с вами в ближайшее время!');
    }

    private _replyWithOptions(option: BotActions.Option): void {
        new BotReplyBuilder(this.bot).replyByChatId(this.chatId, option);
    }
 
    private _replyWithDefaultMsg(): void {
        new BotReplyBuilder(this.bot).replyByChatId(this.chatId, MESSAGES.DEFAULT_MSG);
    }
}
