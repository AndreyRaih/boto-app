import { Telegraf } from "telegraf"
import { InlineKeyboardButton, KeyboardButton } from "telegraf/typings/core/types/typegram"

export declare namespace BotActions {
    type Manager = {
        lastActionIndex: number;
        actions: Action[];
        actionsMap: any;
        bindActionWithChatId: (chatId: string) => void;
        updateStepData: (chatId: string, step: number) => Promise<void>;
    }

    type ActionReference = {
        id: string;
        step: number;
    }

    type Action = {
        id?: string | null | undefined;
        trigger: string;
        savedData?: Object;
        needToDeleteMessage?: boolean;
        stages: BotActions.Reply[] | string | undefined;
    }

    type Reply = {
        text: string,
        picture?: string
        keyboard?: Reply.Keyboard
    }

    namespace Reply {
        type Keyboard = {
            isInline: boolean;
            buttons: KeyboardButton[] | InlineKeyboardButton[]
        }
    }

    interface IDispatcher {
        id: string;
        chatId: string | null;
        bot: Telegraf | null;
        instance: BotActions.Manager | null | undefined;
        executor: BotActions.IExecutor | null | undefined;
        actionRef: BotActions.ActionReference | null;
        linkedAction: BotActions.Action | null;
        initialize: (bot: Telegraf, id: string) => Promise<void>;
    }

    interface IExecutor {
        bot: Telegraf;
        action: BotActions.Action;
        execute: (step: number) => Promise<{ id: string, step: number }>;
    }
}