import * as express from 'express';

import botModule from './modules/bot';
import actionsModule from './modules/actions';
import analyticModule from './modules/analytic';

const router = express.Router();

router.use('/bot', botModule);
router.use('/actions', actionsModule);
router.use('/analytic', analyticModule);

export default router;
