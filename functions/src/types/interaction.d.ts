import { Telegraf } from "telegraf";
import { BotActions } from "./action";
import { Bot } from "./bot";

export declare namespace BotInteraction {
    interface IManager {
        actions: BotActions.Action[];
        actionsProgressMap: any;
        updateActionProgressData: (chatId: string | null, data: Partial<BotActions.Progress.Update>) => Promise<void>;
        deleteActionProgressData: (chatId: string | null) => Promise<void>;
    }

    interface IDispatcher {
        id: string;
        chatId: string | null;
        bot: Telegraf | null;
        botData: Bot.IBot | null;
        instance: IManager | null | undefined;
        executor: IExecutor | null | undefined;
        actionProgress: BotActions.Progress | undefined;
        initialize: (bot: Bot.IBot, id: string) => Promise<void>;
    }

    interface IExecutor {
        bot: Telegraf;
        actions: BotActions.Action[];
        publishPost: () => void;
        executeAction: (progress?: BotActions.Progress) => Promise<BotActions.Progress.Update | void>;
        finishAction: (progress: BotActions.Progress) => void
    }
}