export declare namespace BotActions {
    type Action = {
        analyticId: string;
        bot: string;
        creatorId: string;
        id: string;
        stages: BotActions.Stage[]
    }

    type Stage = {
        id: string;
        images: string[];
        text: string;
        event: BotActions.Event;
        trigger: BotActions.Trigger;
        triggers?: BotActions.Trigger[];
        nextId?: string | null;
        parentId?: string | null;
    }

    type Event = {
        label: string;
        value: string;
    }

    type Trigger = {
        type: 'button' | 'input';
        description: string;
        text: string | null;
        matchString?: string | null;
        validation: string | null;
        inputNeedMatch: boolean;
        id?: string;
    }
}