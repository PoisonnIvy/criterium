import {getProjects, updateProject, getProjectById, createProject, } from '../controllers/projectController.js';

import {Router} from 'express';  

const router = Router();

router.get('/projects', getProjects);
router.get('/projects/:id', getProjectById);
router.post('/projects', createProject);
router.put('/projects/:id', updateProject);

export default router;
// el metodo put y patch son iguales, pero el put reemplaza todo el objeto y el patch solo actualiza los campos que se le pasan