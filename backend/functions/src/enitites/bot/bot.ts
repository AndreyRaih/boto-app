import * as admin from "firebase-admin";
import { Telegraf } from "telegraf";
import { Bot } from "../../types/bot";

export default class BotData implements Bot.IBot {
  id: string;
  activeScenario!: string;
  analyticId!: string;
  name: string = '';
  admins: Bot.User[] = [];
  subscribers: Bot.User[] = [];
  telegrafInstance: Telegraf | null = null;
  editToken: null | string = null

  constructor(id: string) {
    if (!id) throw new Error(
      "Bot cannot be initialized without [id]"
    );
    
    this.id = id;
  }

  async run(): Promise<void> {
    // 1. Restore bot data
    const { token,  name, admins, subscribers, activeScenario, analyticId, editToken } = await this._restoreBotData();
    if (!token) throw new Error("Bot doesnt exist");

    // 2. Initialize bot
    this.telegrafInstance = new Telegraf(token as string, {
      telegram: { webhookReply: true },
    })
    this.admins = admins;
    this.subscribers = subscribers;
    this.name = name;
    this.activeScenario = activeScenario;
    this.analyticId = analyticId;
    this.editToken = editToken;
  };

  async handleUpdates(request: any, response: any): Promise<void> {
    if (!this.telegrafInstance) throw new Error("Bot is uninstall");
    console.log('Incoming message', request.body)
    return await this.telegrafInstance.handleUpdate(request.body, response);
  }

  async setAdmin(data: any) {
    const admins = Array.from(new Set([...this.admins, data]));
    this.admins = admins;
    admin.firestore().collection('bots').doc(this.id).update({ admins });
  };

  async setSubscriber(data: any) {
    const subscribers = Array.from(new Set([...this.subscribers, data]));
    this.subscribers = subscribers;
    admin.firestore().collection('bots').doc(this.id).update({ subscribers });
  };

  async updateSubscriberData(id: string, updates: Partial<Bot.User>) {
    const index = this.subscribers.findIndex(({ id: subscriberId }) => subscriberId === id);
    this.subscribers[index] = { ...this.subscribers[index], ...updates };
    admin.firestore().collection('bots').doc(this.id).update({ subscribers: this.subscribers });
  }

  async updateAdminData(id: string, updates: Partial<Bot.User>) {
    const index = this.admins.findIndex(({ id: adminId }) => adminId === id);
    this.admins[index] = { ...this.admins[index], ...updates };
    admin.firestore().collection('bots').doc(this.id).update({ admins: this.admins });
  } 

  private async _restoreBotData(): Promise<any> {
    return admin.firestore().collection('bots').doc(this.id).get().then(res => res.data());
  }
}