import * as express from 'express';
import { createBot, getBotListById, getBotById } from '../../../handlers/bot';

const router = express.Router();

router.post('/create', async (req, res, next) => {
  const { token, name } = req.body;
  if (!token || !name) res.status(400).send(new Error("fields [token] and [name] are required"));

  try {
    await createBot(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
  next();
});

router.get('/list/:id', async (req, res, next) => {  
    const { id } = req.params;
    if (!id) res.status(400).send(new Error("param [id] is required"));

    try {
        const result: any[] = await getBotListById(id);
        res.status(200).send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
    next();
})

router.get('/:id', async (req, res, next) => {  
    const { id } = req.params;
    if (!id) res.status(400).send(new Error("param [id] is required"));
    
    try {
        const bot = await getBotById(id);
        res.status(200).send(bot);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
    next();
})

export default router;