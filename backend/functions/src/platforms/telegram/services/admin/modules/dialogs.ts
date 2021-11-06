import * as express from 'express';
import admin = require('firebase-admin');
import { getDialogsById } from '../../../handlers/dialogs';

const router = express.Router();

router.post('/list', async(req, res) => {
    if (!req.body.ids) res.status(400).send(new Error("[id] is required param"))
    try {
        const list = [];
        const dialogs = await admin.firestore().collection('dialogs').listDocuments();
        for (const botId of req.body.ids) {
            const botsDialogs = dialogs.filter(item => item.id.startsWith(botId))
            for (const dialog of botsDialogs) {
                const item = await (await dialog.get()).data();
                list.push({ botId, ...item });
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