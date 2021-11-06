import * as express from 'express';

import botModule from './modules/bot';
import actionsModule from './modules/actions';
import dialogsModule from './modules/dialogs';

const router = express.Router();

router.use('/bot', botModule);
router.use('/actions', actionsModule);
router.use('/dialogs', dialogsModule);

export default router;
