import { Telegraf } from "telegraf";
import { BotActions } from "../../../../types/action";
import { EVENT_MAP } from "../analytic/observer";
import BotReplyBuilder from "./replyBuilder";

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
            const stageId = this.dialog.currentId || (this.scenario.stages[0] as any).id;
            const stage = this._createStage(stageId);

            const setAnswer = async (value: string | null = null, id: string | null = null) => {
                // Fire event
                if (stage.event) this.analytic.updateSuite(EVENT_MAP.SCENARIO.ADD_EVENT, stage.event);

                // Build message object
                const message = {
                    date: Date.now(),
                    event: stage.event,
                    text: value
                }

                // Create timestamp
                const firstSessionTimestamp = message.date - ([...(this.dialog.history as any[])].map(({ date }) => date).filter((date) => (message.date - date) < 3600000).reverse()[0] || 0);

                // Restart chat if `/start` command recieved
                if (value === '/start') {
                    const botReply = await new BotReplyBuilder(this.telegraf).replyByChatId(this.dialog.id, this._createStage((this.scenario.stages[0] as any).id)) as any;
                    this._updateEvents(firstSessionTimestamp, botReply.isLastMsg);
                    resolve({
                        history: [message, botReply],
                        currentId: (this.scenario.stages[0] as any).id
                    })
                } else {
                    const botReply = await new BotReplyBuilder(this.telegraf).replyByChatId(this.dialog.id, this._createStage(id || stageId)) as any;
                    this._updateEvents(firstSessionTimestamp, botReply.isLastMsg);
                    resolve({
                        history: value ? [...this.dialog.history, message, botReply] : [...this.dialog.history],
                        currentId: id || stageId
                    })
                }
            }

            this.telegraf.action(/.+/, async (ctx: any) => {
                const value = ctx.match[0];
                const trigger = this.scenario.stages.find(({ id }) => id === value);
                const text = trigger ? trigger.title : null;
                if (trigger && text) {
                    setAnswer(text, trigger.id)
                } else {
                    setAnswer()
                }
            });

            this.telegraf.on('message', (ctx: any) => setAnswer(ctx.message.text));
        })
    }

    private _updateEvents(timestamp: number | null = null, isLastMsg: boolean) {
        this.analytic.updateSuite(EVENT_MAP.TIMING.UPDATE, timestamp)
        this.analytic.updateSuite(EVENT_MAP.BASIC.SET_MESSAGE)
        if (isLastMsg) {
            this.analytic.updateSuite(EVENT_MAP.BASIC.SET_LEAD)
            this.analytic.updateSuite(EVENT_MAP.USER.ADD_LEAD)
        }
    }

    private _createStage(stageId: string): BotActions.Stage {
        const currentStage = this.scenario.stages.find(({ id }: any) => id === stageId) as BotActions.Stage;
        return currentStage
    }
}