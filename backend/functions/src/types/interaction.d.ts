import { Telegraf, Telegram } from "telegraf";
import { BotActions } from "./action";
import { Bot } from "./bot";

export declare namespace BotInteraction {
    interface IManager {
        actions: BotActions.Action[];
        actionsProgressMap: any;
        updateActionProgressData: (chatId: string | null, data: Partial<BotActions.Progress>) => Promise<void>;
        deleteActionProgressData: (chatId: string | null) => Promise<void>;
    }

    interface IDispatcher {
        id: string;
        chatId: string | null;
        bot: Telegraf | null;
        botData: Bot.IBot | null;
        instance: IManager | null | undefined;
        actionProgress: BotActions.Progress | undefined;
        initialize: (bot: Bot.IBot, id: string) => Promise<void>;
    }

    interface IExecutor {
        bot: Telegraf;
        botData: Bot.IBot;
        chatId: string;
        actions: BotActions.Action[];
        progress: BotActions.Progress | undefined;
        executeAction: () => Promise<BotActions.Update>;
    }

    interface IPublisher {
        bot: Telegraf;
        botData: Bot.IBot;
        publishPost: () => void;
    }
}