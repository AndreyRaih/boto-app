export declare namespace BotActions {
    type Action = {
        trigger: string;
        type: Action.Type;
        greetingMessage?: string;
        stages: Reply[] | string | null | undefined;
    }

    namespace Action {
        type Type = 'SELECT' | 'INPUT' | 'SUBSCRIBE';
    }

    type Reply = {
        text: string;
        step: number;
        description: string;
        picture?: string;
        deleteMessage?: boolean;
        options?: Option[] | null | undefined;
        tips?: Tip[] | null | undefined;
    }

    type Tip = {
        text: string;
    }

    type Option = {
        text: string;
        isSub?: boolean;
        children?: Option[] | null;
        callback_data: string;
    }

    type Progress = {
        id: string;
        type: Action.Type;
        data: Progress.Data[] | undefined | null;
    }

    namespace Progress {
        type Update = {
            id: string;
            finish: boolean;
            data: Data | null
        };
        
        type Data = {
            step: number;
            value: string;
            description: string;
        }
    }
}