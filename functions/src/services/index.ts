import * as express from 'express';

import createService from './create';
import interactionService from './interaction';

const router = express.Router()

router.use('/create', createService);
router.use('/interaction', interactionService);

export default router;
