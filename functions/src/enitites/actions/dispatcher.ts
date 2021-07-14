import * as admin from "firebase-admin";
import { Telegraf } from "telegraf";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { BotActions } from "../../types/action";
import { BotInteraction } from "../../types/interaction";
import BotActionExecutor from "./executor";
import { actionCoverter } from "../../utils/converter";

export default class BotActionDispatcher implements BotInteraction.IDispatcher {
  id: string;
  chatId: string | null = null;
  bot: Telegraf | null = null;
  instance: BotInteraction.IManager | null | undefined = null;
  executor: BotInteraction.IExecutor | null = null;

  constructor(id: string) {
    if (!id) throw new Error("[id] is required");
    this.id = id;
  }

  get actionProgress(): BotActions.Progress | null {
    if (!this.chatId || !this.instance) return null;

    return this.instance.actionsProgressMap[this.chatId] || null;
  }

  async initialize(bot: Telegraf, chatId: string): Promise<void> {
    // 1. Define instance
    this.instance = await admin.firestore()
      .collection('actions')
      .doc(this.id)
      .withConverter(actionCoverter)
      .get()
      .then(data => data.data());
    
    // 2. Set chatId
    this.chatId = chatId;

    // 3. Linked bot
    this.bot = bot;

    // 4. Set the executor
    

    // 4. Set default actions
    await this._initializeDefaultActions();

    // 5. Set linked actions
    await this._initializeActions();
  }

  private async _initializeDefaultActions() {
    this.bot?.start((ctx) => 
      ctx.reply('Start message, describe allow commands')
    );

    this.bot?.catch((err, ctx) => {
      console.log('[Bot] Error', err)
      ctx.reply(`Ooops, encountered an error for ${ctx.updateType}`, err as ExtraReplyMessage)
    })
  }

  private async _initializeActions() {
    if (!this.bot) throw new Error("[bot] should be defined");
    if (!this.instance) throw new Error("[instance] should be defined");

    const linkedActionsExecutor = new BotActionExecutor(this.bot, this.instance.actions, this.actionProgress);

    linkedActionsExecutor.execute().then(updates => {
      console.log(updates)
      updates && this._updateActions(updates)
    });
  }

  private async _updateActions(updates: Partial<BotActions.Progress.Update>): Promise<any> {
    await this.instance?.updateActionProgressData(this.chatId, updates);
    return admin.firestore()
      .collection('actions')
      .doc(this.id)
      .withConverter(actionCoverter)
      .set(this.instance, { merge: true });
  }
}