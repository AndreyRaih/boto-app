import * as express from 'express';
import BotData from '../enitites/bot/bot';
import BotActionDispatcher from '../enitites/actions/dispatcher';
import { BotActions } from '../types/action';
// import BotCache from '../enitites/cache';

const router = express.Router();
// const cache = new BotCache();

router.post('/bot/:id', async (req, res, next) => {
  const { id } = req.params;
  const actionManager: BotActions.IDispatcher = new BotActionDispatcher(id);
  const reciever = new BotData(id, actionManager);
  
  try {
    await reciever.run();
    reciever.handleUpdates(req, res);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
  next();
});

export default router;
