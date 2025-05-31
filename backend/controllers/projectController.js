import mongoose from 'mongoose';
import Project from '../models/Project.js';

export const createProject = async (req, res) => {
    const { name, description, status, leadInvestigator, members } = req.body;
//el "members" de la peticion será solo un 
// array de objetos con userId de los miembros
// y el rol del miembro se asignará en el servidor
    try {
        const leader={
            userId: leadInvestigator, //REQUIRED
            role: 'leader', //REQUIRED
        }
        const memberObjects = members
            .filter(m => m.userId !== leadInvestigator) // Evita duplicar el líder
            .map(m => ({
                userId: m.userId,
                role: 'collaborator'
            }));
        const newProject = new Project({
            name, //REQUIRED
            description, //REQUIRED
            status,
            leadInvestigator,   //REQUIRED
            members:[leader, ...memberObjects]
        });

        await newProject.save();

        res.status(201).json({ message: 'Proyecto creado exitosamente', project: newProject });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el proyecto', error });
    }
}

export const getProjects = async (req, res) => {
    const userId = req.session.userId;
    const { role, status } = req.query; // El rol se pasa como query parameter
    if (!userId) {
            return res.status(401).json({ message: 'No autenticado' });
        }
    try {

        let filter = { "members.userId": new mongoose.Types.ObjectId(userid) };
        if (role) {
            filter = { members: { $elemMatch: { userId: new mongoose.Types.ObjectId(userId), role  } } };
        }
        if (status) {
            filter.status = status;
        }
        const projects = await Project.find(filter).populate('members.userId','_id name email' );
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar los proyectos', error });
    }
}

export const getProjectById = async (req, res) => {
    const { id } = req.params;
    const userId =req.session.userId;
    if (!userId) {
            return res.status(401).json({ message: 'No autenticado' });
    }
    try {
        const project = await Project.findById(id).populate('members.userId','_id name email' );;
        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }   
        // Verificar si el usuario pertenece al proyecto
        const isMember = project.members.some(
            m => m.userId._id.toString() === userId.toString()
        );
        if (!isMember) {
            return res.status(403).json({ message: 'No tienes acceso a este proyecto' });
        }

        res.status(200).json(project);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al intentar buscar el proyecto', error });
    }
}

export const updateProject = async (req, res) => {
    const { id } = req.params; //del proyecto
    const userId = req.session.userId;
    const { name, description, status, members } = req.body;

    try {
        const updatedProject = await Project.findById(id);
        if (!updatedProject.canEditBaseForm(userId)) {
            return res.status(403).json({ message: 'No tienes permisos para editar miembros' });
        }
        if (!updatedProject) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }
        if (name) updatedProject.name = name;
        if (description) updatedProject.description = description;
        if (status) updatedProject.status = status;
        if (members) updatedProject.members = members;
        await updatedProject.save();
        res.status(200).json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el proyecto', error });
    }
}   

export const deleteProject = async (req, res) => {
    const { id } = req.params; //del proyecto

    try {
        const deletedProject = await Project.findByIdAndDelete(id);

        if (!deletedProject) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        res.status(200).json({ message: 'El proyecto se ha eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Ha ocurrido un error al eliminar el proyecto', error });
    }
}
