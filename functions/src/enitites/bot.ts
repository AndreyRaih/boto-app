import * as admin from "firebase-admin";
import { Telegraf } from "telegraf";
import { BotInteraction } from "../types/interaction";
import { Bot } from "../types/bot";

export default class BotData implements Bot.IBot {
  id: string;
  actionDispatcher: BotInteraction.IDispatcher;
  botInstance: Telegraf | null = null;

  constructor(id: string, dispatcher: BotInteraction.IDispatcher) {
    if (!id || !dispatcher) throw new Error(
      "Bot cannot be initialized without [id] and [actionManager] fields"
    );
    
    this.id = id;
    this.actionDispatcher = dispatcher;
  }

  async run(ctx: any): Promise<void> {
    // 1. Restore bot data
    const { token } = await this._restoreBotDataById();
    if (!token) throw new Error("Bot doesnt exist");

    // 2. Initialize bot
    this.botInstance = new Telegraf(token as string, {
      telegram: { webhookReply: true },
    })

    // 3. Initialize the actions by chatId
    const { chat } = ctx.message || ctx.callback_query.message;
    await this.actionDispatcher.initialize(this.botInstance, chat.id);
  };

  async handleUpdates(request: any, response: any): Promise<void> {
    if (!this.botInstance) throw new Error("Bot is uninstall");
    console.log('Incoming message', request.body)
    return await this.botInstance.handleUpdate(request.body, response);
  }

  private async _restoreBotDataById(): Promise<any> {
    return admin.firestore().collection('bots').doc(this.id).get().then(res => res.data());
  }
}