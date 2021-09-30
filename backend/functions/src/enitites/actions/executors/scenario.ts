import { Telegraf } from "telegraf";
import { BotActions } from "../../../types/action";
import BotReplyBuilder from "../replyBuilder";

/* const valiadtionMap: any = {
    '': new RegExp(/.+/, 'g')
} */

export class BotScenarioExecutor {
    telegraf: Telegraf;
    scenario: BotActions.Action;
    dialog: any;
    analytic: any;

    constructor(telegraf: Telegraf, scenario: BotActions.Action, dialog: any, analytic: any) {
        this.telegraf = telegraf;
        this.scenario = scenario;
        this.dialog = dialog;
        this.analytic = analytic;
    }

    execute() {
        return new Promise((resolve) => {
            const stageId = this.dialog.currentId || (this.scenario.stages[0] as any).key;
            const stage = this._createStage(stageId);

            const setAnswer = (value: string | null = null, id: string | null = null) => {
                if (stage.event) this._handleEvent(stage.event);

                const botReply = new BotReplyBuilder(this.telegraf).replyByChatId(this.dialog.id, this._createStage(id || stageId));

                const updates = value ? [...this.dialog.history, {
                    date: Date.now(),
                    event: stage.event,
                    text: value
                }, botReply] : [...this.dialog.history];

                resolve({
                    history: updates,
                    currentId: id || stageId
                })
            }

            this.telegraf.action(/.+/, async (ctx: any) => {
                const value = ctx.match[0];
                await ctx.answerCbQuery(`О, ${value}! Отличный выбор!`);
                const trigger = stage.triggers?.find(({ id }) => value === id);
                const text = trigger ? `Кнопка (${trigger.description}): ${trigger.text}` : null;
                if (trigger && text) {
                    setAnswer(text, trigger.id)
                } else {
                    setAnswer()
                }
            });

            this.telegraf.on('message', (ctx: any) => {
                const text = ctx.message.text;
                const inputTriggers = stage.triggers?.filter(({ type }) => type === 'input') as BotActions.Trigger[];
                let matchedTriggerId = null;
                for (const hint of inputTriggers) {
                    if (
                        // (hint.validation && this._checkValidations(hint.validation, text)) ||
                        (hint.inputNeedMatch && hint.matchString === text) ||
                        (hint.matchString?.includes(text))
                    ) matchedTriggerId = hint.id;
                }
                setAnswer(text, matchedTriggerId)
            });
        })
    }

    /* private _checkValidations(validation: string, text: string): boolean {
        switch(validation) {
            case '': return (valiadtionMap[''] as RegExp).test(text);
            default: return false;
        }
    } */

    private _handleEvent(event: BotActions.Event) {}

    private _createStage(stageId: string): BotActions.Stage {
        const currentStage = this.scenario.stages.find(({ key }: any) => key === stageId) as BotActions.Stage;
        const triggers = this.scenario.stages.filter(({ parentId }) => parentId === stageId).map(({ id, trigger }) => ({...trigger, id }));
        return {
            ...currentStage,
            triggers
        }
    }
}