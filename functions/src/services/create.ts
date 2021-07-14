import * as express from 'express';
import ActionsCreator from '../enitites/creators/action';
import BotCreator from '../enitites/creators/bot';

const router = express.Router();

router.post('/bot', async (req, res, next) => {
  const { token, name } = req.body;
  if (!token || !name) res.status(400).send(new Error("fields [token] and [name] are required"));

  const creator = new BotCreator(token, name);

  try {
    await creator.createBot();
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
  next();
});

router.post('/action', async (req, res, next) => {
  const { botId, action } = req.body;
  const creator = new ActionsCreator(botId, action);

  try {
    await creator.createAction();
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
  next();
});

export default router;
