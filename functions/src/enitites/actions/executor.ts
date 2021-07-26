import { Context, Telegraf } from "telegraf";
import { BotActions } from "../../types/action";
import { Bot } from "../../types/bot";
import { BotInteraction } from "../../types/interaction";
import { MESSAGES } from "../../utils/defaults";
import BotReplyBuilder from "./replyBuilder";

const START_COMMAND = '/start';
const SEND_MESSAGE_TO_SUBSCRIBERS = '/send_post';
const ADD_ADMIN = '/add_admin';
const ADD_SUBSCRIBER = '/add_subsriber';

export default class BotActionExecutor implements BotInteraction.IExecutor {
    bot: Telegraf;
    botData: Bot.IBot;
    chatId: string;
    actions: BotActions.Action[];

    constructor(bot: Telegraf, data: Bot.IBot, chatId: string, actions: BotActions.Action[] = []) {
        this.bot = bot;
        this.botData = data;
        this.chatId = chatId;
        this.actions = actions;
    };

    publishPost(): void {
        this.bot.on("message", async (ctx: any) => {
            this.botData.subscribers.forEach(subscriberChatId => new BotReplyBuilder(this.bot).replyByChatId(subscriberChatId, ctx.message?.text))
            this.botData.updateState('IDLE');
        })
    }

    async executeAction(progress?: BotActions.Progress): Promise<BotActions.Progress.Update | void>{
        return new Promise((resolve, reject) => {
            let action = this.actions.find(action => action.trigger === progress?.id);

            const resolveFromStage = (value: string, step: number, description: string) => resolve({
                id: progress?.id as string,
                finish: (action?.stages as BotActions.Stage[]).length - 1 === step,
                next: action?.nextAction,
                data: {
                    description,
                    step,
                    value
                }
            });

            const resolveFromOptionSelect = (value: string) => resolve({
                id: progress?.id as string,
                finish: true,
                next: action?.nextAction,
                data: {
                    description: 'Answer',
                    step: 0,
                    value
                }
            });

            const resolveFromCommand = (restart: boolean) => resolve({
                id: null,
                finish: false,
                restart,
                isCommand: true,
                data: null
            });

            const resolveFromTrigger = (id: string) => resolve({
                id,
                finish: false,
                data: null
            });

            this.bot.on("message", async (ctx: any) => {
                const text = ctx.message?.text;
                const isCommand = text.charAt(0) === '/';
    
                if (isCommand) {
                    const { type, trigger, restart } = (await this._replyWithAction(text, ctx)) || { type: '', data: null, restart: false };
                    return type === 'ACTION' ? resolveFromTrigger(trigger as string) : resolveFromCommand(Boolean(restart))
                }

                if (!progress) return this._replyWithDefaultMsg();

                if (!action || !action.stages) throw reject(new Error("[action.stages] should be defined"));
                const step = progress?.data ? progress?.data.length : 0;
                const stage = action?.stages[step + 1] as BotActions.Stage;
                const description = (action?.stages[step] as BotActions.Stage).description;
                const hasNextStage = Boolean(stage);

                if (hasNextStage) this._replyWithStage(stage as BotActions.Stage)
                if (!hasNextStage && action.nextAction) setTimeout(() => this._replyWithAction(action?.nextAction as string, ctx), 0);
                resolveFromStage(text, step, description);
            })

            this.bot.action(/.+/, async (ctx: any) => {
                await ctx.answerCbQuery(`О, ${ctx.match[0]}! Отличный выбор!`);
                resolveFromOptionSelect(ctx.match[0])
            });
        })
    }

    async finishAction(progress: BotActions.Progress): Promise<void> {
        // @ts-ignore
        const { first_name, last_name, username } = await this.bot.telegram.getChat(this.chatId);
        const name = username ? `@${username}` : `${first_name} ${last_name}`;
        const resultMsg = `${name} - ${MESSAGES.RESULT_MSG} ${progress.id}: \n${progress.data?.map(item => `${item.description}: ${item.value}`).join('\n')}`;
        this.botData.admins.forEach(adminChatId => new BotReplyBuilder(this.bot).replyByChatId(adminChatId, resultMsg))
    }

    private _executeCommand(command: string, ctx: Context): boolean {
        switch (command) {
            case START_COMMAND:
                new BotReplyBuilder(this.bot).replyByChatId(this.chatId, MESSAGES.START_MSG)
                this.botData.updateState("IDLE")
                return true;
            case ADD_ADMIN:
                new BotReplyBuilder(this.bot).replyByChatId(this.chatId, MESSAGES.ADMIN_MSG)
                this.botData.setAdmins(ctx.message?.chat.id.toString() as string)
                this.botData.updateState("IDLE")
                return true;
            case ADD_SUBSCRIBER:
                new BotReplyBuilder(this.bot).replyByChatId(this.chatId, MESSAGES.SUBSCRIBER_MSG)
                this.botData.setSubscribers(ctx.message?.chat.id.toString() as string)
                this.botData.updateState("IDLE")
                return true;
            case SEND_MESSAGE_TO_SUBSCRIBERS:
                new BotReplyBuilder(this.bot).replyByChatId(this.chatId, MESSAGES.SENDING_MSG)
                this.botData.updateState("SENDING_MESSAGE")
                return false;
            default:
                return false;
        }
    }

    private async _replyWithAction(text: string, ctx: Context): Promise<BotActions.CommandDescription | undefined> {
        const commands = [START_COMMAND, SEND_MESSAGE_TO_SUBSCRIBERS, ADD_ADMIN, ADD_SUBSCRIBER]
        const triggers: string[] = this.actions.map(action => action.trigger);

        if (triggers.includes(text)) {
            const action = this.actions.find(action => action.trigger === text) as BotActions.Action;
            this._replyWithStage((action.stages as BotActions.Stage[])[0]);
            return {
                type: 'ACTION',
                trigger: action.trigger
            };
        }

        if (commands.includes(text)) {
            this._executeCommand(text, ctx);
            return { type: 'COMMAND', restart: true }
        }
        return;
    }

    private _replyWithStage(stage: BotActions.Stage): void {
        new BotReplyBuilder(this.bot).replyByChatId(this.chatId, stage)
    }
 
    private _replyWithDefaultMsg(): void {
        new BotReplyBuilder(this.bot).default(this.chatId, MESSAGES.DEFAULT_MSG, this.actions.map(action => `${action.trigger} - ${action.description}`));
    }
}
