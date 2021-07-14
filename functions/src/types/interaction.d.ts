import { Telegraf } from "telegraf";
import { BotActions } from "./action";

export declare namespace BotInteraction {
    interface IManager {
        actions: BotActions.Action[];
        actionsProgressMap: any;
        updateActionProgressData: (chatId: string | null, data: Partial<BotActions.Progress.Update>) => Promise<void>;
    }

    interface IDispatcher {
        id: string;
        chatId: string | null;
        bot: Telegraf | null;
        instance: IManager | null | undefined;
        executor: IExecutor | null | undefined;
        actionProgress: BotActions.Progress | null;
        initialize: (bot: Telegraf, id: string) => Promise<void>;
    }

    interface IExecutor {
        bot: Telegraf;
        actions: BotActions.Action[];
        progress: BotActions.Progress | null;

        execute: () => Promise<BotActions.Progress.Update | void>;
    }
}