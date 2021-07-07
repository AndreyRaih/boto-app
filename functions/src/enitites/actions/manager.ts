import { BotActions } from "../../types/action";

export default class BotActionManager implements BotActions.Manager {
    lastActionIndex: number = 0;
    actionsMap: any = {};
    actions: BotActions.Action[] = [];

    constructor(actions: BotActions.Action[] = [], map: any = {}, index: number = 0) {
        this.actions = actions;
        this.actionsMap = map;
        this.lastActionIndex = index;
    }

    get nextActionIndex(): number {
        return this.lastActionIndex + 1 < (this.actions.length as number) ? this.lastActionIndex + 1 : 0;
    }

    bindActionWithChatId(chatId: string): void {
        const { id } = this.actions[this.nextActionIndex] as BotActions.Action;
        if (!id) throw new Error("Cannot define new action");
    
        this.actionsMap[chatId] = {
          id,
          step: 0
        };
        this.lastActionIndex = this.nextActionIndex;
    }

    async updateStepData(chatId: string, step: number): Promise<void> {
        if (!this.actionsMap[chatId]) throw new Error("Cannot find actionReference with this chat id");
        
        this.actionsMap[chatId].step = step;
    }
}