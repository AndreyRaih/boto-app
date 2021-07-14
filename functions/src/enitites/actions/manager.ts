import { BotActions } from "../../types/action";
import { BotInteraction } from "../../types/interaction";

export default class BotActionManager implements BotInteraction.IManager {
    actionsProgressMap: any = {};
    actions: BotActions.Action[] = [];

    constructor(actions: BotActions.Action[] = [], map: any = {}) {
        this.actions = actions;
        this.actionsProgressMap = map;
    }

    async updateActionProgressData(chatId: string | null, data: Partial<BotActions.Progress.Update>): Promise<void> {
        if (!chatId) throw new Error("[chatId] should be defined");
        const { id, finish, data: patched } = data;

        if (finish) {
            delete this.actionsProgressMap[chatId];
        } else {
            if (!this.actionsProgressMap[chatId] || this.actionsProgressMap[chatId].id !== id) {
                this.actionsProgressMap[chatId] = { id, data: patched ? [ patched ] : [] }; 
            } else {
                this.actionsProgressMap[chatId].data.push(patched);
            }
        }
    }
}