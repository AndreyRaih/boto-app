import * as admin from "firebase-admin";
import { Telegraf } from "telegraf";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { BotActions } from "../../types/action";

export default class BotData {
  id: string;
  actionManager: BotActions.IDispatcher;
  bot: Telegraf | null = null;

  constructor(id: string, actionManager: BotActions.IDispatcher) {
    if (!id) throw new Error(
      "Bot cannot be initialized without [id] and [actionManager] fields"
    );
    
    this.id = id;
    this.actionManager = actionManager;
  }

  async run(): Promise<void> {
    // Restore bot data
    const { token } = await this._restoreBotDataById();
    if (!token) throw new Error("Bot doesnt exist");

    // Initialize bot
    this.bot = new Telegraf(token as string, {
      telegram: { webhookReply: true },
    })

    // initialize error handling
    this.bot.catch((err, ctx) => {
      console.log('[Bot] Error', err)
      ctx.reply(`Ooops, encountered an error for ${ctx.updateType}`, err as ExtraReplyMessage)
    })

    // initialize the actions flow
    await this.actionManager.initialize();
    
    this.bot.command('/start', (ctx) => this.actionManager.start(ctx))
    this.bot.on('message', (ctx) => this.actionManager.handle(ctx))
  };

  async handleUpdates(request: any, response: any) {
    if (!this.bot) throw new Error("Bot is uninstall");
    console.log('Incoming message', request.body)
    return await this.bot.handleUpdate(request.body, response);
  }

  private async _restoreBotDataById(): Promise<any> {
    return admin.firestore().collection('bots').doc(this.id).get().then(res => res.data());
  }
}