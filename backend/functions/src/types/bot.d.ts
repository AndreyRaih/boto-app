import { Telegraf } from "telegraf";

export declare namespace Bot {
    interface IBot {
        id: string;
        analyticId: string;
        activeScenario: string;
        telegrafInstance: Telegraf | null;
        name: string,
        run: (ctx: any) => Promise<void>;
        handleUpdates: (req: any, res: any) => Promise<void>;
    }
}