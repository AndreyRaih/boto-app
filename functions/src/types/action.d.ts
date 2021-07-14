export declare namespace BotActions {
    type Action = {
        trigger: string;
        greetingMessage?: string;
        stages: Reply[] | string | null | undefined;
    }

    type OptionsAppearance = 'BUTTON' | 'KEYBOARD';

    type Reply = {
        text: string;
        type: 'SELECT' | 'INPUT';
        step: number;
        picture?: string;
        description?: string;
        optionsAppearance?: OptionsAppearance;
        deleteMessage?: boolean;
        options?: Option[] | null | undefined
    }

    type Option = {
        text: string;
        value: string;
    }

    type Progress = {
        id: string;
        data: Progress.Data[] | undefined | null;
    }

    namespace Progress {
        type Update = {
            id: string;
            finish?: boolean;
            data: Data | null
        };
        
        type Data = {
            step: number;
            value: any[] | string | null | undefined;
            description?: string;
        }
    }
}