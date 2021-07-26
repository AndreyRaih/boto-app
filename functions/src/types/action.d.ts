export declare namespace BotActions {
    type Action = {
        trigger: string;
        type: Action.Type;
        description: string;
        nextAction?: string;
        endMsg?: string;
        stages: Stage[] | string | null | undefined;
    }

    namespace Action {
        type Type = 'SELECT' | 'INPUT' | 'SUBSCRIBE';
    }

    type Stage = {
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

    type CommandDescriptionType = 'ACTION' | 'COMMAND';

    type CommandDescription = {
        type: CommandDescriptionType;
        trigger?: string | null;
        restart?: boolean;
    }

    type Progress = {
        id: string;
        data: Progress.Data[] | undefined | null;
    }

    namespace Progress {
        type Update = {
            id: string | null;
            finish: boolean;
            restart?: boolean;
            isCommand?: boolean;
            next?: string;
            data: Data | null
        };
        
        type Data = {
            step?: number;
            description: string;
            value: string;
        }
    }
}