import * as admin from "firebase-admin";
import { Telegraf } from "telegraf";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { BotActions } from "../../types/action";
import BotActionExecutor from "./executor";

export default class BotActionDispatcher implements BotActions.IDispatcher {
  id: string;
  chatId: string | null = null;
  bot: Telegraf | null = null;
  instance: BotActions.Manager | null = null;
  executor: BotActions.IExecutor | null = null;

  constructor(id: string) {
    if (!id) throw new Error("[id] is required");
    this.id = id;
  }

  get actionRef(): BotActions.ActionReference | null {
    if (!this.chatId || !this.instance) return null;

    return this.instance.actionsMap[this.chatId] || null;
  }

  get linkedAction(): BotActions.Action | null {
    if (!this.actionRef) throw new Error("[actionRef] should be defined");
    if (!this.instance) throw new Error("[instance] should be defined");

    const action = this.instance?.actions.find(({ id }) => id === this.actionRef?.id);
    return action ? { ...action } : null;
  }

  get nextActionIndex(): number {
    if (!this.instance) return 0;
    return this.instance.lastActionIndex + 1 < (this.instance?.actions.length as number) ? this.instance.lastActionIndex + 1 : 0;
  }

  async initialize(bot: Telegraf, chatId: string): Promise<void> {
    // 1. Define instance
    this.instance = await admin.firestore().collection('actions').doc(this.id).get().then(data => data.data() as BotActions.Manager);
    
    // 2. Set chatId
    this.chatId = chatId;
    if (!this.actionRef) {
      this._runNew(this.chatId);
    }

    // 3. Linked bot
    this.bot = bot;

    // 4. Set default actions
    await this._initializeDefaultActions();

    // 5. Set linked actions
    await this._initializeLinkedActions();
  }

  private async _initializeDefaultActions() {
    this.bot?.command('/start', (ctx) => this._runNew(ctx.chat.id.toString()));

    this.bot?.catch((err, ctx) => {
      console.log('[Bot] Error', err)
      ctx.reply(`Ooops, encountered an error for ${ctx.updateType}`, err as ExtraReplyMessage)
    })
  }

  private async _initializeLinkedActions() {
    if (!this.bot) throw new Error("[bot] should be defined");
    if (!this.linkedAction) throw new Error("[linkedAction] should be defined");
    
    const linkedActionsExecutor = new BotActionExecutor(this.bot, this.linkedAction);
    linkedActionsExecutor.execute();
  }

  async _runNew(chatId: string): Promise<void> {
    await this._bindNewActionWithChatId(chatId);
    this._updateActionsLastIndex();
  }

  private _bindNewActionWithChatId(chatId: string): void {
    if (!this.instance) throw new Error("[instance] cannot be empty");

    const { id } = this.instance?.actions[this.nextActionIndex] as BotActions.Action;
    if (!id) throw new Error("Cannot define new action");
    
    //@ts-ignore
    this.instance?.actionsMap[chatId] = {
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