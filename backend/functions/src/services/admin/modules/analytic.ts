import * as express from 'express';
import { getInvoicesByBotId } from '../../../handlers/analytic';

const router = express.Router();

router.get('/invoices/:id', async(req, res) => {
    if (!req.params.id) res.status(400).send(new Error("[id] is required param"))

    try {
        const list = await getInvoicesByBotId(req.params.id as string);
        res.status(200).send(list);
    } catch(err) {
        res.status(500).send(err);
    }
})

export default router;