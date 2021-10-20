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
        title?: string;
        event: BotActions.Event;
        triggers: BotActions.Trigger[];
    }

    type Event = {
        label: string;
        value: string;
    }

    type Trigger = {
        destinationId: string;
        text: string;
    }
}