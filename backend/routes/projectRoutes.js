import {getProjects, updateProject, getProjectById, createProject, } from '../controllers/projectController.js';

import {Router} from 'express';  

const router = Router();

router.get('/projects/user', getProjects); //todos los projectos de 1 usuario
router.get('/project/:id', getProjectById); // 1 projecto por usuario con id del projecto
router.post('/project', createProject);
router.patch('/projects/:id', updateProject);

export default router;