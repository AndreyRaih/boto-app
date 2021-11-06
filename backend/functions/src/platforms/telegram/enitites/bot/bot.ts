import * as admin from "firebase-admin";
import { Telegraf } from "telegraf";
import { Bot } from "../../../../types/bot";

export default class BotData implements Bot.IBot {
  id: string;
  activeScenario!: string;
  analyticId!: string;
  name: string = '';
  telegrafInstance: Telegraf | null = null;

  constructor(id: string) {
    if (!id) throw new Error(
      "Bot cannot be initialized without [id]"
    );
    
    this.id = id;
  }

  async run(): Promise<void> {
    // 1. Restore bot data
    const { token,  name, activeScenario, analyticId } = await this._restoreBotData();
    if (!token) throw new Error("Bot doesnt exist");

    // 2. Initialize bot
    this.telegrafInstance = new Telegraf(token as string, {
      telegram: { webhookReply: true },
    })
    this.name = name;
    this.activeScenario = activeScenario;
    this.analyticId = analyticId;
  };

  async handleUpdates(request: any, response: any): Promise<void> {
    if (!this.telegrafInstance) throw new Error("Bot is uninstall");
    console.log('Incoming message', request.body)
    return await this.telegrafInstance.handleUpdate(request.body, response);
  }

  private async _restoreBotData(): Promise<any> {
    return admin.firestore().collection('bots').doc(this.id).get().then(res => res.data());
  }
}