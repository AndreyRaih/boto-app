import { Telegraf } from "telegraf";
import { BotActions } from "../../types/action";

export default class BotActionExecutor implements BotActions.IExecutor {
    bot: Telegraf;
    action: BotActions.Action;

    constructor(bot: Telegraf, action: BotActions.Action) {
        this.bot = bot;
        this.action = action;
    };

    execute() {
        if (!this.action?.stages) throw new Error("[action.stages] is required");

        for (const stage of this.action.stages) {
            this._addStageToBot(stage);
        }
    }

    private _addStageToBot(stage: BotActions.Stage): void {
        switch (stage.type) {
            case 'COMMAND':
                console.log('set cmd from', stage)
                this.bot.command(stage.commandName || '/', (ctx) => {
                    console.log('here command', ctx)
                    this._buildHandlerForStage(stage.handlerDef, ctx)
                });
                break;
            case 'LISTENER':
                console.log('set listener from', stage)
                this.bot.on(stage.listenerEvent || 'text', (ctx) => {
                    console.log('here listener', ctx)
                    this._buildHandlerForStage(stage.handlerDef, ctx)
                });
                break;
            default:
                break;
        }
    }

    private _buildHandlerForStage(definition: BotActions.Stage.HandlerDefinition, ctx: any) {
        console.log('set def from', definition)
        switch (definition.type) {
            case 'REPLY':
                if (!definition.replyText) throw new Error("Action should contain the reply message");
                
                return ctx.telegram.sendMessage(ctx.chat.id, definition.replyText);
            case 'WIZARD':
                if (!definition.wizard) throw new Error("Action should have wizard definition");

                return this._buildWizardForHandlerDef(definition.wizard, ctx);
            default:
                break;
        }
    }

    private _buildWizardForHandlerDef(wizardDef: BotActions.Stage.Wizard, ctx: any) {
        return ctx.telegram.sendMessage(ctx.chat.id, 'here will be wizard');
    }
}