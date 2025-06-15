import {Router} from 'express';  
import {requireAuth} from '../middleware/AuthMiddleware.js';
import { 
    addArticle, 
    removeArticle, 
    markArticle, 
    getArticles, 
    getArticleById,
    updateArticle} from '../controllers/articleController.js';

import {  isMember  } from '../middleware/hasProjectAccess.js';


const router = Router();
router.use(requireAuth);

router.post('/project/:projectId/article/add',isMember(),addArticle);

router.get('/project/:projectId/all/articles',isMember(), getArticles);

router.get('/project/:projectId/one/:articleId', isMember(),getArticleById);

router.delete('/project/:projectId/article/remove/:articleId',isMember(), removeArticle);

router.patch('/project/:projectId/article/screening/:articleId', isMember(),markArticle); //cribado

router.patch('/project/:projectId/article/modify/:articleId',isMember(), updateArticle); 

export default router;