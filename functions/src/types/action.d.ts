import { WizardScene } from "telegraf/typings/scenes"

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
    }

    interface IDispatcher {
        id: string;
        instance: BotActions.Manager | null | undefined;
        executor: BotActions.IExecutor | null | undefined;
        initialize: () => Promise<void>;
        handle: (ctx: any) => void;
        start: (ctx: any) => any;
    }

    interface IExecutor {
        execute: (ctx: any, action: BotActions.Action) => void
    }
}