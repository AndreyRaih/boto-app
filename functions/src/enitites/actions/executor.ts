import { Telegraf } from "telegraf";
import { BotActions } from "../../types/action";
import { BotInteraction } from "../../types/interaction";
import BotReplyBuilder from "./replyBuilder";

export default class BotActionExecutor implements BotInteraction.IExecutor {
    bot: Telegraf;
    chatId: string;
    actions: BotActions.Action[];

    constructor(bot: Telegraf, chatId: string, actions: BotActions.Action[] = []) {
        this.bot = bot;
        this.chatId = chatId;
        this.actions = actions;
    };

    async defineTriggers(): Promise<BotActions.Progress.Update> {
        const builder = new BotReplyBuilder(this.bot);
        return Promise.race(
            this.actions.map(action =>
                builder.command(action)
                    .then(() => ({
                        id: action.trigger,
                        type: action.type,
                        finish: false,
                        data: null
                    })))
            )
    }

    async execute(progress?: BotActions.Progress): Promise<BotActions.Progress.Update | void>{
        if (!progress) return this._replyWithDefaultMsg();

        const step: number = progress.data?.length || 0;
        const action = this.actions.find(action => action.trigger === progress.id);
        if (!action || !action.stages || !action.stages.length) throw new Error("[action] and [action.stages] shouldbe defined");
        
        const stage = action.stages[step] as BotActions.Reply;

        console.log(progress, stage)

        return await new BotReplyBuilder(this.bot).stage(this.chatId, stage, action.type)
            .then(data => ({
                id: action.trigger,
                type: action.type,
                finish: action.type === 'INPUT' ? data.step === (action.stages?.length as number) - 1 : true,
                data
            }));
    }

    private _replyWithDefaultMsg(): void {
        setTimeout(() => new BotReplyBuilder(this.bot)
            .default('List of commands:', this.actions.map(action => `${action.trigger} - description`)), 0);
    }
}
