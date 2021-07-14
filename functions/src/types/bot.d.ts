import { Telegraf } from "telegraf";
import { BotInteraction } from "./interaction";

export declare namespace Bot {
    interface IBot {
        id: string;
        botInstance: Telegraf | null;
        actionDispatcher: BotInteraction.IDispatcher;
        run: (ctx: any) => Promise<void>;
        handleUpdates: (req: any, res: any) => Promise<void>
    }
}