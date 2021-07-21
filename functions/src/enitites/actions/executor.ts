import { Telegraf } from "telegraf";
import { BotActions } from "../../types/action";
import { BotInteraction } from "../../types/interaction";
import BotReplyBuilder from "./replyBuilder";

const START_COMMAND = '/start';
const SEND_MESSAGE_TO_SUBSCRIBERS = '/send_post';
const ADD_ADMIN = '/add_admin';
const ADD_SUBSCRIBER = '/add_subsriber';

export default class BotActionExecutor implements BotInteraction.IExecutor {
    bot: Telegraf;
    chatId: string;
    actions: BotActions.Action[];

    constructor(bot: Telegraf, chatId: string, actions: BotActions.Action[] = []) {
        this.bot = bot;
        this.chatId = chatId;
        this.actions = actions;
    };

    async execute(progress?: BotActions.Progress): Promise<BotActions.Progress.Update | void>{
        return new Promise((resolve, reject) => {
            let action = this.actions.find(action => action.trigger === progress?.id);

            const resolveWithValue = (value?: string, step?: number) => resolve({
                id: progress?.id as string,
                finish: (action?.stages as BotActions.Stage[]).length - 1 === step,
                data: value ? {
                    step,
                    value
                } : null
            });

            this.bot.on("message", (ctx: any) => {
                const text = ctx.message?.text;
                const isCommand = text.charAt(0) === '/';
                const commands = [START_COMMAND, SEND_MESSAGE_TO_SUBSCRIBERS, ADD_ADMIN, ADD_SUBSCRIBER]
                const triggers: string[] = this.actions.map(action => action.trigger);
    
                if (isCommand) {
                    if (triggers.includes(text)) {
                        action = this.actions.find(action => action.trigger === text) as BotActions.Action;
                        this._replyWithStage((action.stages as BotActions.Stage[])[0])
                        return resolve({
                            id: action.trigger,
                            finish: false,
                            data: null
                        });
                    }
                    if (commands.includes(text)) {
                        // commands impl 
                    }
                }

                if (!progress) return this._replyWithDefaultMsg();

                if (!action || !action.stages) throw reject(new Error("[action.stages] should be defined"));
                const step = progress?.data ? progress?.data.length : 0;
                const stage = action?.stages[step + 1] as BotActions.Stage;

                if (stage) this._replyWithStage(stage as BotActions.Stage)

                resolveWithValue(text, step);
            })

            if (action?.type === "SELECT") {
                this.bot.action(/.+/, async (ctx: any) => {
                    await ctx.answerCbQuery(`Oh, ${ctx.match[0]}! Great choice`);
                    resolveWithValue(ctx.match[0], 0)
                });
            }
        })
    }

    private _replyWithStage(stage: BotActions.Stage): void {
        new BotReplyBuilder(this.bot).replyByChatId(this.chatId, stage)
    }
 
    private _replyWithDefaultMsg(): void {
        new BotReplyBuilder(this.bot).default(this.chatId, 'List of commands:', this.actions.map(action => `${action.trigger} - description`));
    }
}
