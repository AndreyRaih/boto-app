import * as admin from "firebase-admin";
import { Telegraf } from "telegraf";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { BotActions } from "../../types/action";
import { BotInteraction } from "../../types/interaction";
import BotActionExecutor from "./handlers/executor";
import { actionCoverter } from "../../utils/converter";
import { Bot } from "../../types/bot";
import BotPostPublisher from "./handlers/publisher";
import BotSystemCommandsExecutor from "./handlers/systemCommands";
import BotRegistrationExecutor from "./handlers/registration";

export default class BotActionDispatcher implements BotInteraction.IDispatcher {
  id: string;
  chatId: string | null = null;
  bot: Telegraf | null = null;
  botData: Bot.IBot | null = null;
  instance: BotInteraction.IManager | null | undefined = null;

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

    // 4. Add errors handling and system commands
    const systemCommandsExecutor = new BotSystemCommandsExecutor(this.bot, this.botData);
    systemCommandsExecutor.run()
    
    // 5. Define stage
    this._defineCurrentStage();

    this.bot?.catch((err, ctx) => {
      console.log('[Bot] Error', err)
      ctx.reply(`Ooops, encountered an error for ${ctx.updateType}`, err as ExtraReplyMessage)
    })
  }

  private async _defineCurrentStage(): Promise<void> {
    if (!this.botData || !this.bot || !this.chatId) throw new Error("[bot], [botData], [chatId] should be defined");
    
    const isSendingMsg = this.botData.admins.some(({ id }) => id === this.chatId) && this.botData.admins.find(({ id }) => id === this.chatId)?.sendingMessageInProgress;
    const isRegistration = this.botData.subscribers.some(({ id }) => id === this.chatId) && this.botData.subscribers.find(({ id }) => id === this.chatId)?.registrationInProgress;
    const isNeedToRunAction = !Boolean(this.actionProgress);
    const isActive = Boolean(this.actionProgress);

    if (isSendingMsg) {
      const publisher = new BotPostPublisher(this.bot, this.botData);
      publisher.publishPost();
    }

    const registrationExecutor = new BotRegistrationExecutor(this.bot, this.botData);
    registrationExecutor.run();
    
    if (isRegistration) {
      return registrationExecutor.executeRegistration()
    }

    const executor = new BotActionExecutor(this.bot, this.botData, this.chatId, this.instance?.actions, this.actionProgress)
    let updates: BotActions.Update | null = null;

    if (isNeedToRunAction) {
      updates = await executor.runAction();
    }

    if (isActive) {
      updates = await executor.executeAction()
    }
    
    if (!updates) return;
    await this._updateActions(updates);

    if (updates.finish) {
      await executor?.finishAction(this.actionProgress as BotActions.Progress)
      this.instance?.deleteActionProgressData(this.chatId);
      await this._updateInstance();
    }
  }

  private async _updateActions(updates: Partial<BotActions.Update>): Promise<any> {
    if (updates.data) await this.instance?.updateActionProgressData(this.chatId, updates.data);
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