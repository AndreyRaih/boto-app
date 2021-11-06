import * as express from 'express';
import { sendMessageByChatId, recieveMessageByBotId } from '../../handlers/bot';

const router = express.Router();

router.post('/reply/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    console.log(id)
    await recieveMessageByBotId(id, req, res);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
  next();
});

router.post('/send_message', async (req, res, next) => {
  const { from, to } = req.body;
  if (!from || !to) res.status(400).send(new Error('[from], [to] are required query params'));

  sendMessageByChatId(req.body);
  res.sendStatus(200);
  next();
});

export default router;
