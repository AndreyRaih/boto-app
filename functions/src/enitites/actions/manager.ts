import { BotActions } from "../../types/action";
import { BotInteraction } from "../../types/interaction";

export default class BotActionManager implements BotInteraction.IManager {
    actionsProgressMap: any = {};
    actions: BotActions.Action[] = [];

    constructor(actions: BotActions.Action[] = [], map: any = {}) {
        this.actions = actions;
        this.actionsProgressMap = map;
    }

    async updateActionProgressData(chatId: string | null, updates: Partial<BotActions.Progress>): Promise<void> {
        if (!chatId) throw new Error("[chatId] should be defined");
        this.actionsProgressMap[chatId] = { ...this.actionsProgressMap[chatId], ...updates }
    }

    async deleteActionProgressData(chatId: string | null): Promise<void> {
        if (!chatId) throw new Error("[chatId] should be defined");
        delete this.actionsProgressMap[chatId];
    }
}