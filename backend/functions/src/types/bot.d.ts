import { Telegraf } from "telegraf";

export declare namespace Bot {
    type ContactData = {
        name?: string | null;
        phone: string | null;
        adress?: string | null;
    }

    type User = {
        id: string;
        isPaused?: boolean;
        sendingMessageInProgress?: boolean;
        registrationInProgress?: boolean;
        contactData?: ContactData;
    }

    interface IBot {
        id: string;
        telegrafInstance: Telegraf | null;
        name: string,
        admins: User[],
        subscribers: User[],
        run: (ctx: any) => Promise<void>;
        handleUpdates: (req: any, res: any) => Promise<void>
        setAdmin: (chatId: string) => Promise<void>;
        setSubscriber:(chatId: string) => Promise<void>;
        updateSubscriberData: (chatId: string, updates: Partial<Bot.User>) => Promise<void>;
        updateAdminData: (chatId: string, updates: Partial<Bot.User>) => Promise<void>;
    }
}