import { Telegraf } from "telegraf";

export declare namespace Bot {
    type State = 'IDLE' | 'EDITED' | 'SENDING_MESSAGE';

    interface IBot {
        id: string;
        telegrafInstance: Telegraf | null;
        name: string,
        state: State,
        admins: string[],
        subscribers: string[],
        run: (ctx: any) => Promise<void>;
        handleUpdates: (req: any, res: any) => Promise<void>
        updateState: (state: State) => Promise<void>
        setAdmins: (chatId: string) => Promise<void>;
        setSubscribers:(chatId: string) => Promise<void>;
    }
}