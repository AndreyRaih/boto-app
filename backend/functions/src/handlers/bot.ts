import * as admin from "firebase-admin";
import { Telegraf } from "telegraf";
import BotInteractionDispatcher from "../enitites/actions/dispatcher";
import BotReplyBuilder from "../enitites/actions/replyBuilder";
import BotoAnalyticObserver from "../enitites/analytic/observer";
import BotData from "../enitites/bot/bot";
import BotCreator from '../enitites/bot/creator';
import { Bot } from "../types/bot";
import { createAnalyticSuite } from "./analytic";

export const createBot = async ({ userId, token, name }: { userId: string, token: string, name: string}) => {
    const creator = new BotCreator(userId, token, name);
    await creator.createBot();
    const bot = await (await admin.firestore().collection('bots').doc(creator.id).get()).data() as any;
    const analytic = await createAnalyticSuite(creator.analyticId);
    return { id: creator.id, ...bot, analytic };
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
    const bot = (await admin.firestore().collection('bots').doc(id).get()).data() as any;
    const analyticObserver = new BotoAnalyticObserver(bot.analyticId);
    await analyticObserver.initialize();
    const activeScenario = bot && bot.activeScenario ? await (await admin.firestore().collection('actions').doc(bot.activeScenario).get()).data() as any : null;
    const analytic = analyticObserver.getSuiteSnapshot();
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

export const sendMessageByChatId = async (data: any) => {
    const { from, to, message } = data;
    const reciever = new BotData(from as string);
    await reciever.run();
    const replier = new BotReplyBuilder(reciever.telegrafInstance as Telegraf)
    replier.replyByChatId(to, (message || ''))
}

export const recieveMessageByBotId = async (id: string, req: any, res: any) => {
    const message = (req.body.message || req.body.callback_query.message)

    const reciever: Bot.IBot = new BotData(id);
    await reciever.run(req.body);

    if (!reciever.activeScenario) throw new Error("Bot doesnt has active scenario");
    const dispatcher = new BotInteractionDispatcher(reciever.activeScenario, reciever.analyticId, message.chat.id.toString());
    await dispatcher.initialize(reciever as Bot.IBot);
    reciever.handleUpdates(req, res);
}