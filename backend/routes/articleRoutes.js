import { addArticle, removeArticle, markArticle, getArticles } from '../controllers/articleController.js';

import {Router} from 'express';  

const router = Router();

router.get('/art', getArticles);
router.post('/art/:id', removeArticle);
router.post('/art', addArticle);
router.put('/art/:id', markArticle);

export default router;