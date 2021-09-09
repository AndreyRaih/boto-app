import * as express from 'express';

import botModule from './modules/bot';
import actionsModule from './modules/actions';
import invoicesModule from './modules/invoices';

const router = express.Router();

router.use('/bot', botModule);
router.use('/actions', actionsModule);
router.use('/invoices', invoicesModule);

export default router;
