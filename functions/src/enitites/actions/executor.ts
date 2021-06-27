import { BotActions } from "../../types/action";

export default class BotActionExecutor implements BotActions.IExecutor {
    constructor() {};

    execute(ctx: any, action: BotActions.Action) {
        const { id } = action;
        if (!id) throw new Error("Scene cannot be set up withoud [id]")
        
        // here would be implemented executing actions...
    }
}