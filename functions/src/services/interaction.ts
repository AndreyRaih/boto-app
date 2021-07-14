import * as express from 'express';
import BotData from '../enitites/bot';
import BotActionDispatcher from '../enitites/actions/dispatcher';
import { BotInteraction } from '../types/interaction';

const router = express.Router();

router.post('/bot/:id', async (req, res, next) => {
  const { id } = req.params;
  const actionManager: BotInteraction.IDispatcher = new BotActionDispatcher(id);
  const reciever = new BotData(id, actionManager);
  
  try {
    await reciever.run(req.body);
    reciever.handleUpdates(req, res);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
  next();
});

export default router;
