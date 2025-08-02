import {Router} from 'express';
import { 
    searchWorks,
    checkOpenAccess
} from '../controllers/webArticlesController.js';
import { isMember, projectAccess } from '../middleware/hasProjectAccess.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth);

router.post("/crossref/:projectId", isMember(), projectAccess,searchWorks)
router.post("/unpaywall/data/:projectId", isMember(), projectAccess, checkOpenAccess)

export default router;
