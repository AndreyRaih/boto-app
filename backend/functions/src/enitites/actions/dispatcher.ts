import * as admin from "firebase-admin";
import { Telegraf } from "telegraf";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { BotActions } from "../../types/action";
import { Bot } from "../../types/bot";
import { BotRegistrationExecutor } from "./executors/registration";
import { BotScenarioExecutor } from "./executors/scenario";

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
  
  constructor(actionId: string, analyticId: string, chatId: string) {
    this.actionId = actionId;
    this.analyticId = analyticId;
    this.chatId = chatId.toString();
  }

  async initialize(bot: Bot.IBot): Promise<void> {
    // 1. Define instances
    const { telegrafInstance } = bot;
    const scenario = await (await admin.firestore().collection('actions').doc(this.actionId).get()).data() as BotActions.Action;
    const analytic = await (await admin.firestore().collection('analytic').doc(this.analyticId).get()).data() as any;
    const dialogInstance = await (await admin.firestore().collection('dialogs').doc(this.chatId).get()).data() as any;
    this.instances = {
      bot,
      scenario,
      analytic,
      dialog: { ...dialogInstance, id: this.chatId },
      telegraf: telegrafInstance as Telegraf
    };
    
    // 2. Define stage
    this._defineCurrentStage();

    this.instances.telegraf?.catch((err, ctx) => {
      console.log('[Bot] Error', err)
      ctx.reply(`Ooops, encountered an error for ${ctx.updateType}`, err as ExtraReplyMessage)
    })
  }

  private async _defineCurrentStage(): Promise<void> {
    if (!this.instances.bot || !this.instances.telegraf || !this.chatId) throw new Error("[bot], [botData], [chatId] should be defined");
    
    const hasProgress = Boolean(this.instances.dialog);
    if (!hasProgress) {
      await admin.firestore().collection('dialogs').doc(this.chatId).set({ contactData: {}, history: [], lastEvent: null, nextId: null })
    }
    const hasContactData = Boolean(this.instances.dialog.contactData) &&
      'name' in this.instances.dialog.contactData &&
      'phone' in this.instances.dialog.contactData &&
      'address' in this.instances.dialog.contactData;
    if (!hasContactData) {
      const contactData = await new BotRegistrationExecutor(this.instances.telegraf, this.instances.dialog.contactData).execute();
      this._updateDialogData({ contactData })
    }
    const updates = await new BotScenarioExecutor(this.instances.telegraf, this.instances.scenario, this.instances.dialog, this.instances.analytic).execute();
    this._updateDialogData(updates)
  }

  private _updateDialogData(updates: any) {
    return admin.firestore().collection('dialogs').doc(this.chatId).set(updates, { merge: true });
  }
}