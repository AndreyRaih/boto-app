import * as express from 'express';
import { getBotById } from '../../../handlers/bot';
import { getDialogsById } from '../../../handlers/dialogs';

const router = express.Router();

router.post('/list', async(req, res) => {
    if (!req.body.ids) res.status(400).send(new Error("[id] is required param"))

    try {
        const list = [];
        for (const botId of req.body.ids) {
            const bot = await getBotById(botId) as any;
            for (const subscriber of bot.subscribers) {
                const dialogs = await (await (await getDialogsById(subscriber.id.toString())).get()).data();
                list.push({
                    id: subscriber.id,
                    botId,
                    ...dialogs
                })
            }
        }
        res.status(200).send(list);
    } catch(err) {
        res.status(500).send(err);
    }
})

router.get('/:id', async(req, res) => {
    if (!req.params.id) res.status(400).send(new Error("[id] is required param"))

    try {
        const dialog = await (await (await getDialogsById(req.params.id)).get()).data();
        res.status(200).send(dialog);
    } catch(err) {
        res.status(500).send(err);
    }
})

export default router;