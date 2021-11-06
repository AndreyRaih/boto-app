import * as admin from "firebase-admin";
import { Telegraf } from "telegraf";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { BotActions } from "../../../../types/action";
import { Bot } from "../../../../types/bot";
import BotoAnalyticObserver, { EVENT_MAP } from "../analytic/observer";
import { BotScenarioExecutor } from "./scenario";

export default class BotInteractionDispatcher {
  instances!: {
    bot: Bot.IBot;
    telegraf: Telegraf;
    scenario: BotActions.Action;
    analytic: any
    dialog: any;
  }
  actionId: string;
  analyticId: string;
  chatId: string;
  analyticObserver: any;
  
  constructor(actionId: string, analyticId: string, chatId: string) {
    this.actionId = actionId;
    this.analyticId = analyticId;
    this.chatId = chatId.toString();
  }

  async initialize(bot: Bot.IBot): Promise<void> {
    // 1. Define instances
    this.instances = await this._loadInstances(bot);
    
    // 2. Define stage
    this._defineCurrentStage();

    this.instances.telegraf?.catch((err, ctx) => {
      console.log('[Bot] Error', err)
      ctx.reply(`Ooops, encountered an error for ${ctx.updateType}`, err as ExtraReplyMessage)
    })
  }

  private async _loadInstances(bot: Bot.IBot) {
    const { telegrafInstance } = bot;
    const scenario = await (await admin.firestore().collection('actions').doc(this.actionId).get()).data() as BotActions.Action;
    const analytic = new BotoAnalyticObserver(this.analyticId);
    await analytic.initialize()
    const dialogInstance = await (await admin.firestore().collection('dialogs').doc(`${bot.id}:${this.chatId}`).get()).data() as any;
    return {
      bot,
      scenario,
      analytic,
      dialog: dialogInstance || null,
      telegraf: telegrafInstance as Telegraf
    }
  }

  private async _defineCurrentStage(): Promise<void> {
    if (!this.instances.bot || !this.instances.telegraf || !this.chatId) throw new Error("[bot], [botData], [chatId] should be defined");
    
    const hasProgress = Boolean(this.instances.dialog);
    if (!hasProgress) {
      const defaultDialog = { history: [], id: parseInt(this.chatId) };
      await admin.firestore().collection('dialogs').doc(`${this.instances.bot.id}:${this.chatId}`).set(defaultDialog)
      this.instances.dialog = defaultDialog;
      this.instances.analytic.updateSuite(EVENT_MAP.BASIC.SET_USER);
    }
    const updates = await new BotScenarioExecutor(this.instances.telegraf, this.instances.scenario, this.instances.dialog, this.instances.analytic).execute() as any;
    this._updateDialogData(updates)
  }

  private _updateDialogData(updates: any) {
    return admin.firestore().collection('dialogs').doc(`${this.instances.bot.id}:${this.chatId}`).set(updates, { merge: true });
  }
}