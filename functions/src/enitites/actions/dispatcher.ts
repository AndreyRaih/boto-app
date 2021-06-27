import * as admin from "firebase-admin";
import { BotActions } from "../../types/action";
import BotActionExecutor from "./executor";

export default class BotActionDispatcher implements BotActions.IDispatcher {
  id: string;
  instance: BotActions.Manager | null = null;
  executor: BotActions.IExecutor | null = null;

  constructor(id: string) {
    if (!id) throw new Error("[id] is required");
    this.id = id;
  }

  get nextActionIndex(): number {
    if (!this.instance) return 0;
    return this.instance.lastActionIndex + 1 < (this.instance?.actions.length as number) ? this.instance.lastActionIndex + 1 : 0;
  }

  async initialize(): Promise<void> {
    this.instance = await admin.firestore().collection('actions').doc(this.id).get().then(data => data.data() as BotActions.Manager);
    this.executor = new BotActionExecutor();
  }

  async start(ctx: any): Promise<void> {
    await this._bindNewActionWithChatId(ctx);
    this._updateActionsLastIndex();
  }

  async handle(ctx: any) {
    const actionRef: BotActions.ActionReference = this.instance?.actionsMap[ctx.chat.id];
    if (!actionRef) {
      this.start(ctx);
    }
    //@ts-ignore
    const action: BotActions.Action = { ...this.instance?.actions.find(({ id }) => id === actionRef.id) } || { id: null, stages: [] };
    action.stages = [ ...action.stages || [] ].slice(actionRef.step);
    return this.executor?.execute(ctx, action);
  }

  private _bindNewActionWithChatId(ctx: any): void {
    if (!this.instance) throw new Error("[instance] cannot be empty");

    const { id } = this.instance?.actions[this.nextActionIndex] as BotActions.Action;
    if (!id) throw new Error("Cannot define new action");
    
    //@ts-ignore
    this.instance?.actionsMap[ctx.chat.id] = {
      id,
      step: 0
    };
  }

  private _updateActionsLastIndex(): Promise<any> {
    return admin.firestore().collection('actions').doc(this.id).update({
      ...this.instance,
      lastActionIndex: this.nextActionIndex
    });
  }
}