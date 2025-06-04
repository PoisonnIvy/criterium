import mongoose from 'mongoose';
import Project from '../models/Project.js';


export const createProject = async (req, res) => {
    const userId = req.session.userId;
    const { name, description, members } = req.body;
    //el campo members es un array de objetos con id de usuarios
    // el rol por defecto al crear un proyecto es 'collaborator'

    try {
        const leader = {
            userId,
            role: 'leader',
        };
        const memberObjects = members
            .filter(m => m.userId !== userId)
            .map(m => ({
                userId: m.userId,
                role: 'collaborator'
            }));
        const newProject = new Project({
            name,
            description,
            leadInvestigator: userId,
            members: [leader, ...memberObjects]
        });

        await newProject.save();
        res.status(201).json({ message: 'Proyecto creado exitosamente', project: newProject });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el proyecto', error });
    }
};

//  endpoint que obtiene los proyectos de un usuario 
//  segun su rol o el estado del proyecto
export const getProjects = async (req, res) => {
    const userId = req.session.userId;
    const { role, status } = req.query;
    try {
        let filter = { "members.userId": new mongoose.Types.ObjectId(userId) };
        if (role) {
            filter = { members: { $elemMatch: { userId: new mongoose.Types.ObjectId(userId), role } } };
        }
        if (status) {
            filter.status = status;
        }
        const projects = await Project.find(filter).populate('members.userId', '_id name email');
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar los proyectos', error });
    }
};

export const getProjectById = async (req, res) => {
    res.status(200).json(req.project);
};


export const updateProject = async (req, res) => {
    const project = req.project;
    const userRole = req.userRole;
    const { name, description, status, members, removeMember } = req.body;
    /* para eliminar miembros se pasan solo los ids en un array, asi:
    	{  "removeMember":["683a9c2e811b29ea4ac477fd","683683cd4104b16c07b12e9d"]  }
        
        y para añadir se pasan con su id y rol, en un array como objeto cada miembro, asi;
        {  "members":[
          {"userId":"683a9c2e811b29ea4ac477fd","role":"collaborator"},
          {"userId":"683683cd4104b16c07b12e9d","role":"editor"}
          ]  
        }
    */


    if (!['leader', 'editor'].includes(userRole)) {
        return res.status(403).json({ message: 'No tienes permisos para editar el proyecto' });
    }

    if (name) project.name = name;
    if (description) project.description = description;
    if (status) project.status = status;
    if (members) {
    const membersToAdd = Array.isArray(members) ? members : [members];
    project.members.push(...membersToAdd);
    }

    if (removeMember) {
        const idsToRemove = Array.isArray(removeMember) ? removeMember : [removeMember];
        project.members = project.members.filter(member => 
            !idsToRemove.includes(member.userId.toString())
        );
    }

    try {
        await project.save();
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el proyecto', error });
    }
};


export const leaveProject = async (req, res) => {
    const project = req.project;
    const userId = req.session.userId;
    const userRole = req.userRole;

    if (userRole === 'leader') {
        return res.status(403).json({ message: 'El líder no puede abandonar el proyecto' });
    }

 
    try {

        const result = await Project.findByIdAndUpdate(
            project._id,
            { $pull: { members: { userId: userId } } },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }
        res.status(204).json({ message: 'Has abandonado el proyecto exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al salir del proyecto', error });
    }
};
