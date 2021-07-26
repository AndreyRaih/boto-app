import * as admin from "firebase-admin";
import { Telegraf } from "telegraf";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { BotActions } from "../../types/action";
import { BotInteraction } from "../../types/interaction";
import BotActionExecutor from "./executor";
import { actionCoverter } from "../../utils/converter";
import { Bot } from "../../types/bot";

export default class BotActionDispatcher implements BotInteraction.IDispatcher {
  id: string;
  chatId: string | null = null;
  bot: Telegraf | null = null;
  botData: Bot.IBot | null = null;
  instance: BotInteraction.IManager | null | undefined = null;
  executor: BotInteraction.IExecutor | null = null;

  constructor(id: string) {
    if (!id) throw new Error("[id] is required");
    this.id = id;
  }

  get actionProgress(): BotActions.Progress | undefined {
    if (!this.chatId || !this.instance) return;

    return this.instance.actionsProgressMap[this.chatId] || null;
  }

  async initialize(bot: Bot.IBot, chatId: string): Promise<void> {
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
    this.botData = bot;
    this.bot = bot.telegrafInstance as Telegraf;

    // 4. Set the executor
    this.executor = new BotActionExecutor(this.bot, this.botData, this.chatId, this.instance?.actions);
    
    // 5. Set actions
    if (this.botData.state === "SENDING_MESSAGE") {
      this.executor.publishPost()
    } else {
      this.executor.executeAction(this.actionProgress).then(this._updateActions.bind(this));
    }

    this.bot?.catch((err, ctx) => {
      console.log('[Bot] Error', err)
      ctx.reply(`Ooops, encountered an error for ${ctx.updateType}`, err as ExtraReplyMessage)
    })
  }

  private async _updateActions(updates: Partial<BotActions.Progress.Update> | void): Promise<any> {
    if (!updates || updates.isCommand) {
      if (updates && updates?.restart) this.instance?.deleteActionProgressData(this.chatId);
      return this._updateInstance();
    }

    await this.instance?.updateActionProgressData(this.chatId, updates);

    if (updates.finish) {
      this.executor?.finishAction(this.actionProgress as BotActions.Progress)
      this.instance?.deleteActionProgressData(this.chatId);
      if (updates.next) {
        await this.instance?.updateActionProgressData(this.chatId, { id: updates.next, data: null});
      }
    }

    return this._updateInstance();
  }

  private _updateInstance() {
    return admin.firestore()
      .collection('actions')
      .doc(this.id)
      .withConverter(actionCoverter)
      .set(this.instance, { merge: true });
  }
}