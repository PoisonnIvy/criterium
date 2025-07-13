import {Router} from 'express';  
import {requireAuth} from '../middleware/authMiddleware.js';
import { addArticle, removeArticle, markArticle, 
    getArticles, getArticleById,updateArticle, addArticlesBulk} from '../controllers/articleController.js';
import upload from '../middleware/handleUpload.js';
import { uploadArticleFile } from '../controllers/articleController.js';
import {  isMember, projectAccess  } from '../middleware/hasProjectAccess.js';



const router = Router();
router.use(requireAuth);

router.post('/project/:projectId/article/add',isMember(), projectAccess,addArticle);
router.post('/project/:projectId/addBulk', isMember(), projectAccess, addArticlesBulk) //bulk desde api crossref

router.get('/project/:projectId/all/articles',isMember(), getArticles);
router.get('/project/:projectId/one/:articleId', isMember(),getArticleById);

router.delete('/project/:projectId/article/remove/:articleId',isMember(), projectAccess, removeArticle);

router.patch('/project/:projectId/article/screening/:articleId', isMember(), projectAccess, markArticle); //cribado
router.patch('/project/:projectId/article/modify/:articleId',isMember(), projectAccess, updateArticle); 

//carga de articulos || en la query se pasa el id del articulo asociado si corresponde ?articleId=123456
router.post('/project/:projectId/article/upload/:articleId',isMember(), projectAccess, upload.single('archivo'), uploadArticleFile);

export default router;