import * as express from 'express';
import { createBot, getBotListById, getBotById, deleteBotById, setEditTokenToBotById, deleteBotAdminByIds } from '../../../handlers/bot';

const router = express.Router();

router.post('/create', async (req, res, next) => {
  const { token, name, userId } = req.body;
  if (!token || !name || !userId) res.status(400).send(new Error("fields [userId], [token] and [name] are required"));

  try {
    const bot = await createBot(req.body);
    res.status(200).send(bot);
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

router.get('/:id/delete', async (req, res, next) => {
  const { id } = req.params;
  if (!id) res.status(400).send(new Error("[id] is required"));

  try {
    await deleteBotById(id);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
  next();
});

router.post('/:id/set_edit_token', async (req, res, next) => {
  const { token } = req.body;
  try {
    await setEditTokenToBotById(req.params.id, token || null);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
  next();
});

router.post('/:id/delete_admin', async (req, res, next) => {
  const { id } = req.body;
  if (!id) res.status(400).send(new Error("field [id] is required"));

  try {
    await deleteBotAdminByIds(req.params.id, id);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
  next();
});

export default router;