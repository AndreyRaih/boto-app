import { Telegraf } from "telegraf";
import { BotActions } from "./action";

export declare namespace Bot {
    interface IBot {
        id: string;
        botInstance: Telegraf | null;
        actionDispatcher: BotActions.IDispatcher;
        run: (ctx: any) => Promise<void>;
        handleUpdates: (req: any, res: any) => Promise<void>
    }
}