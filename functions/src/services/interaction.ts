import * as express from 'express';
import BotData from '../enitites/bot';
import BotActionDispatcher from '../enitites/actions/dispatcher';
import { BotInteraction } from '../types/interaction';
import { Bot } from '../types/bot';

const router = express.Router();

router.post('/bot/:id', async (req, res, next) => {
  console.log(req.body)
  const { id } = req.params;
  const actionManager: BotInteraction.IDispatcher = new BotActionDispatcher(id);
  const reciever: Bot.IBot = new BotData(id);
  const message = (req.body.message || req.body.callback_query.message)
  
  try {
    await reciever.run(req.body);
    await actionManager.initialize(reciever as Bot.IBot, message.chat.id);
    reciever.handleUpdates(req, res);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
  next();
});

router.get('/bot/:id/edit', async (req, res, next) => {
  const { id } = req.params;
  const bot = new BotData(id);
  
  try {
    await bot.updateState("EDITED");
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
  next();
});

export default router;
