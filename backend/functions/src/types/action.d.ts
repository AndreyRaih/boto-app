export declare namespace BotActions {
    type Action = {
        analyticId: string;
        bot: string;
        creatorId: string;
        id: string;
        stages: BotActions.Stage[]
    }

    type Media = {
        type: 'video' | 'image', 
        url: string
    }

    type Stage = {
        id: string;
        media: Media[];
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