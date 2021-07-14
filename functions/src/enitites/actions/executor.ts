import { Telegraf } from "telegraf";
import { BotActions } from "../../types/action";
import { BotInteraction } from "../../types/interaction";
import BotReplyBuilder from "./replyBuilder";

export default class BotActionExecutor implements BotInteraction.IExecutor {
    bot: Telegraf;
    actions: BotActions.Action[];
    progress: BotActions.Progress | null;

    constructor(bot: Telegraf, actions: BotActions.Action[] = [], progress: BotActions.Progress | null) {
        this.bot = bot;
        this.actions = actions;
        this.progress = progress;
    };

    get currentAction(): BotActions.Action | null {
        return this.actions.find(action => action.trigger === this.progress?.id) || null;
    }

    get currentActionStage(): BotActions.Reply | null {
        if (!this.currentAction || !this.progress?.data) return null;

        if (!Boolean(this.progress.data.length as number)) {
            return (this.currentAction.stages as BotActions.Reply[])[0]
        }
        const { step } = [...this.progress?.data].pop() as BotActions.Progress.Data;
        return ((this.currentAction.stages as BotActions.Reply[]).find(stage => stage.step === step)) || null;
    }

    execute(): Promise<BotActions.Progress.Update>{
        // 1. Define the trigger commands, each run new action

        // 2.Define cases:
        // a. Without progress - send the allow commands list
        // b. With progress - define and handle current step

        console.log(this.progress, this.currentAction, this.currentActionStage);
        if (!this.progress) {
            this._replyWithDefaultMsg()
            return this._defineActionTriggers();
        } else {
            return this._replyWithActionStage();
        }
    }

    private _defineActionTriggers(): Promise<BotActions.Progress.Update> {
        const builder = new BotReplyBuilder(this.bot);
        return Promise.race(
            this.actions.map(action =>
                builder.command(action).then(() => ({ id: action.trigger, data: null }))
            )
        )
    }

    private _replyWithDefaultMsg(): void {
        setTimeout(() => new BotReplyBuilder(this.bot).default('List of commands:', this.actions.map(action => `${action.trigger} - description`)), 0);
    }

    private _replyWithActionStage(): Promise<BotActions.Progress.Update> {
        if (!this.currentActionStage) throw new Error("[currentActionStage] should be defined");
        
        return new BotReplyBuilder(this.bot).stage(this.currentActionStage)
            .then(data => {
                if (!this.currentAction) throw new Error("[currentAction] should be defined");
                return {
                    id: this.currentAction.trigger,
                    finish: this.currentActionStage?.step === (this.currentAction.stages?.length as number) - 1,
                    data
                }
            });
    }
}
