import * as express from 'express';

import interactionService from './interaction';
import adminService from './admin';

const router = express.Router()

router.use('/interaction', interactionService);
router.use('/admin', adminService);

export default router;
