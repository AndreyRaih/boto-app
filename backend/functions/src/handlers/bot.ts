import * as admin from "firebase-admin";
import { Telegraf } from "telegraf";
import BotActionDispatcher from "../enitites/actions/dispatcher";
import BotReplyBuilder from "../enitites/actions/replyBuilder";
import BotData from "../enitites/bot/bot";
import BotCreator from '../enitites/bot/creator';
import { Bot } from "../types/bot";
import { BotInteraction } from "../types/interaction";

export const createBot = async ({ userId, token, name }: { userId: string, token: string, name: string}) => {
    const creator = new BotCreator(userId, token, name);
    await creator.createBot();
    const bot = await (await admin.firestore().collection('bots').doc(creator.id).get()).data() as any;
    return { id: creator.id, ...bot };
}

export const getBotListById = async (id: string) => {
    const result = [];
    const list = await admin.firestore().collection('bots').listDocuments();
    for (const item of list) {
        const data: any = (await item.get()).data();
        const botId = item.id;
        if (data.creatorId === id) result.push({ id: botId, name: data.name, creatorId: data.creatorId })
    }
    return result;
}

export const getBotById = async (id: string) => {
    const bot = await (await admin.firestore().collection('bots').doc(id).get()).data() as any;
    const activeScenario = bot && bot.activeScenario ? await (await admin.firestore().collection('actions').doc(bot.activeScenario).get()).data() as any : null;
    const analytic = activeScenario ? await (await admin.firestore().collection('analytic').doc(activeScenario.analyticId).get()).data() : null
    return bot ? {...bot, id, activeScenario, analytic } : null;
}

export const deleteBotById = (id: string) => {
    return admin.firestore().collection('bots').doc(id).delete();
}

export const setEditTokenToBotById = (id: string, token: string | null) => {
    return admin.firestore().collection('bots').doc(id).update({ editToken: token });
}

export const deleteBotAdminByIds = async (id: string, adminId: number) => {
    const existList = (await (await admin.firestore().collection('bots').doc(id).get()).data() as any).admins;
    return admin.firestore().collection('bots').doc(id).update({ admins: existList.filter((id: number) => id !== adminId) });
}

export const sendMessageByChatId = (data: any) => {
    const { from, to, message } = data;
    const reciever: Bot.IBot = new BotData(from as string);
    const replier = new BotReplyBuilder(reciever.telegrafInstance as Telegraf)
    replier.replyByChatId(to, (message || ''))
}

export const recieveMessageByBotId = async (id: string, req: any, res: any) => {
    const actionManager: BotInteraction.IDispatcher = new BotActionDispatcher(id);
    const reciever: Bot.IBot = new BotData(id);
    const message = (req.body.message || req.body.callback_query.message)
    
    await reciever.run(req.body);
    await actionManager.initialize(reciever as Bot.IBot, message.chat.id);
    reciever.handleUpdates(req, res);
}