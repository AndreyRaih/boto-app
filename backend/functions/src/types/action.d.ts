export declare namespace BotActions {
    type OfferType = 'PRODUCT' | 'SERVICE';

    type ActionType = 'SELECT' | 'INPUT';

    type Action = {
        trigger: string;
        type: ActionType;
        offerType: OfferType;
        description: string;
        nextAction?: string;
        endMsg?: string;
        options: Stage[] | string | null | undefined;
    }

    type Stage = {
        id: string;
        text: string;
        description: string;
        picture?: string;
        options?: Option[] | null | undefined;
    }

    type Option = Stage & {
        parentId?: string;
    }

    type Update = {
        isCommand?: boolean;
        finish?: boolean;
        restart?: boolean;
        next?: string;
        data: Progress | null
    }

    type Progress = {
        id: string | null | undefined;
        history: string[];
        inputs?: Progress.Input[] | undefined | null;
        select?: Progress.Select | undefined | null;
    }

    namespace Progress {
        type Data = {
            description: string;
            value: string | null;
        }

        type Input = Data & {
            step: number
        }

        type Select = Data & {
            breadcrumbs: string[];
        }
    }
}