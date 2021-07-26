import * as admin from "firebase-admin";
import { Telegraf } from "telegraf";
import { Bot } from "../types/bot";

export default class BotData implements Bot.IBot {
  id: string;
  name: string = '';
  state: Bot.State = 'IDLE';
  admins: string[] = [];
  subscribers: string[] = [];
  telegrafInstance: Telegraf | null = null;

  constructor(id: string) {
    if (!id) throw new Error(
      "Bot cannot be initialized without [id]"
    );
    
    this.id = id;
  }

  async run(ctx: any): Promise<void> {
    // 1. Restore bot data
    const { token,  name, admins, subscribers, state } = await this._restoreBotData();
    if (!token) throw new Error("Bot doesnt exist");

    // 2. Initialize bot
    this.telegrafInstance = new Telegraf(token as string, {
      telegram: { webhookReply: true },
    })
    this.admins = admins;
    this.subscribers = subscribers;
    this.state = state;
    this.name = name;
  };

  async handleUpdates(request: any, response: any): Promise<void> {
    if (!this.telegrafInstance) throw new Error("Bot is uninstall");
    console.log('Incoming message', request.body)
    return await this.telegrafInstance.handleUpdate(request.body, response);
  }

  async updateState(state: Bot.State) {
    this.state = state;
    admin.firestore().collection('bots').doc(this.id).update({ state });
  };

  async setAdmins(chatId: string) {
    if (this.state !== "EDITED") throw new Error("[state] should be EDITED");
    
    const admins = [...this.admins, chatId];
    this.admins = admins;
    admin.firestore().collection('bots').doc(this.id).update({ admins });
  };

  async setSubscribers(chatId: string) {
    const subscribers = [...this.subscribers, chatId];
    this.subscribers = subscribers;
    admin.firestore().collection('bots').doc(this.id).update({ subscribers });
  };

  private async _restoreBotData(): Promise<any> {
    return admin.firestore().collection('bots').doc(this.id).get().then(res => res.data());
  }
}