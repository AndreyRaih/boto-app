import { BotActions } from "../../types/action";
import { BotInteraction } from "../../types/interaction";

export default class BotActionManager implements BotInteraction.IManager {
    actionsProgressMap: any = {};
    actions: BotActions.Action[] = [];

    constructor(actions: BotActions.Action[] = [], map: any = {}) {
        this.actions = actions;
        this.actionsProgressMap = map;
    }

    async updateActionProgressData(chatId: string | null, updates: Partial<BotActions.Progress.Update>): Promise<void> {
        if (!chatId) throw new Error("[chatId] should be defined");
        const { id, finish, data } = updates;

        if (finish) {
            delete this.actionsProgressMap[chatId];
            return;
        }
        this.actionsProgressMap[chatId] = {
            id,
            data: Boolean(data) ? [...(this.actionsProgressMap[chatId]?.data || []), data] : data
        };
    }
}