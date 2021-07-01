import { namespace } from "firebase-functions/lib/providers/firestore"
import { Telegraf } from "telegraf"
import { WizardScene } from "telegraf/typings/scenes"
import { UpdateType } from "telegraf/typings/telegram-types"

export declare namespace BotActions {
    type Manager = {
        config?: any;
        lastActionIndex: number;
        actions: Action[];
        actionsMap: any;
    }

    type ActionReference = {
        id: string;
        step: number;
    }

    type Action = {
        id?: string | null | undefined;
        stages: BotActions.Stage[] | undefined;
    }

    type Stage = {
        type: Stage.Types;
        listenerEvent?: UpdateType;
        commandName?: string;
        handlerDef: Stage.HandlerDefinition
    }

    namespace Stage {
        type Types = 'COMMAND' | 'LISTENER';

        type HandlerType = 'WIZARD' | 'REPLY';

        type WizardStep = {
        }

        type Wizard = { 
            id: string,
            steps: WizardStep
        }

        type HandlerDefinition = {
            type: HandlerType;
            replyText?: string | null;
            wizard?: Wizard | null
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
        nextActionIndex: number;
        initialize: (bot: Telegraf, id: string) => Promise<void>;
    }

    interface IExecutor {
        bot: Telegraf;
        action: BotActions.Action;
        execute: (action: BotActions.Action | null) => void;
    }
}