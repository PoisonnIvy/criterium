import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {isMember} from '../middleware/hasProjectAccess.js';
import  getPivotData  from '../controllers/pivottableControler.js';

const router = Router();
router.use(requireAuth);


router.get("/pivottable/pipeline/:projectId", getPivotData)




export default router;