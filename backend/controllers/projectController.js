import mongoose from 'mongoose';
import crypto from 'crypto';
import Project from '../models/project.js';
import { inviteCache } from '../index.js';
import { sendProjectInvitationMail, sendGeneralMail } from "../services/mailSender.js";
import Assignment from '../models/assignment.js';


export const createProject = async (req, res) => {
    const userId = req.session.userId;
    const { name, description} = req.body;
    //el campo members es un array de objetos con id de usuarios
    // el rol por defecto al crear un proyecto es 'colaborador'

    try {
        const leader = {
            userId,
            role: 'investigador principal',
        };
        const newProject = new Project({
            name,
            description,
            leadInvestigator: userId,
            members: [leader]
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
    const {role} =req.query;

    try {
        let filter = { "members.userId": new mongoose.Types.ObjectId(`${userId}`) };
        if (role) {
            filter= {members: { $elemMatch: { userId:userId, role } }};
        }
        
        const projects = await Project.find(filter).populate('members.userId', '_id name email');
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar los proyectos', error });
    }
};

export const getProjectById = async (req, res) => {

    try {
        const project = await req.project.populate('members.userId', 'name email');
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el proyecto', error });
    }
};

export const changeRole = async (req, res) => {
    const project = req.project;
    const { memberId } = req.params;
    const { member } = req.body;
    try {
        await project.populate('members.userId', 'email name');
        const member_ref = project.members.find(m => m.userId._id.toString() === member.userId);
        if (!member_ref) {
            return res.status(404).json({ message: 'Miembro no encontrado' });
        }
        const ac_role = project.getUserRole(memberId);
        if (ac_role === 'investigador principal') return res.status(403).json({ message: 'No puedes cambiar el rol del investigador principal' });

        member_ref.role = member.role;
        await project.save();

        const memberEmail = member_ref.userId.email;
        if (memberEmail) {
            await sendGeneralMail({
                to: memberEmail,
                subject: 'Tu rol ha cambiado en el proyecto',
                title: 'Cambio de rol',
                content: `Tu rol en el proyecto "${project.name}" ha sido cambiado a ${member_ref.role}.`
            });
        }
        res.status(200).json({ message: 'Rol actualizado exitosamente' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al cambiar el rol', error });
    }
}



export const removeMember = async (req, res) => {  
    const project = req.project;
    const { memberId } = req.params;

    const role = project.getUserRole(memberId);

    if( role === 'investigador principal') {
        return res.status(403).json({ message: 'No puedes eliminar al investigador principal' });
    }

    try {
        await project.populate('members.userId', 'email name');
        const member_ref = project.members.find(m => m.userId._id.toString() === memberId);
        const memberEmail = member_ref?.userId?.email;

        await Assignment.updateMany(
            { projectId: project._id, reviewerId: memberId },
            { $set: { reviewerId: null, status: 'no asignado' } }
        );

        const before = project.members.length;
        project.members = project.members.filter(m => m.userId._id.toString() !== memberId);
        if (project.members.length === before) {
            return res.status(404).json({ message: 'Miembro no encontrado' });
        }
        if (memberEmail) {
            await sendGeneralMail({
                to: memberEmail,
                subject: 'Has sido eliminado de un proyecto',
                title: 'Eliminación de proyecto',
                content: `Has sido eliminado del proyecto "${project.name}".`
            });
        }
        await project.save();
        
        return res.status(200).json({ message: 'Miembro eliminado correctamente' }); 
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al eliminar miembro del proyecto', error });
    }
}

export const updateProject = async (req, res) => {
    const project = req.project;
    const userRole = req.userRole;
    const { name, description, screeningCriteria } = req.body;

    if (!['investigador principal', 'editor'].includes(userRole)) {
        return res.status(403).json({ message: 'No tienes permisos para editar el proyecto' });
    }

    if (name) project.name = name;
    if (description) project.description = description;
    if (screeningCriteria) project.screeningCriteria = screeningCriteria;

    try {
        await project.save();
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el proyecto', error });
    }
};

export const changeProjectStatus = async (req, res) => {
    const project = req.project;
    const {status} = req.query;
    if(!['activo', 'deshabilitado', 'completado'].includes(status) || !status) {
        return res.status(400).json({ message: 'Estado inválido'});
    }
    try {
        project.status = status;   
        await project.save();
        res.status(200).json({ message: 'Estado del proyecto actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el estado del proyecto', error });
    }
}


export const leaveProject = async (req, res) => {
    const project = req.project;
    const userId = req.session.userId;
    const userRole = req.userRole;

    if (userRole === 'investigador principal') {
        return res.status(403).json({ message: 'El investigador principal no puede abandonar el proyecto' });
    }

    try {

        await Assignment.updateMany(
            { projectId: project._id, reviewerId: userId },
            { $set: { reviewerId: null, status: 'no asignado' } }
        );

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




export const inviteMember = async (req, res) => {
    const { email, role } = req.body;
    const username = req.session.username;
    const project = req.project;

    try {
         const tokenData = JSON.stringify({
            email,
            projectId: project._id,
            role: role || 'colaborador',
            createdAt: Date.now()
        });
        const iv = Buffer.from(process.env.TOKEN_IV, 'hex');
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.TOKEN_SECRET, 'hex'), iv);
        let encryptedToken = cipher.update(tokenData, 'utf8', 'hex');
        encryptedToken += cipher.final('hex');


        inviteCache.set(encryptedToken, { email, projectId: project._id, role: role || 'colaborador' });

        const inviteLink = `${process.env.CLIENT_URL}/invitacion/${encryptedToken}`;
        await sendProjectInvitationMail({
            to: email,
            inviterName: username,
            projectName: project.name,
            inviteLink,
            role: role || 'colaborador'
        });

        res.status(200).json({ message: 'Invitación enviada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al enviar la invitación', error });
    }
};

export const acceptInvite = async (req, res) => {
    const { token } = req.params;
    const userId = req.session.userId; // El usuario debe estar logueado
    const userEmail = req.session.email;

    try {
        
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.TOKEN_SECRET, 'hex'), Buffer.from(process.env.TOKEN_IV, 'hex'));
        let decryptedToken = decipher.update(token, 'hex', 'utf8');
        decryptedToken += decipher.final('utf8');

        const invite = JSON.parse(decryptedToken);

        if (!invite || invite.email !== userEmail) {
            return res.status(403).json({ message: 'No tienes permiso para aceptar esta invitación' });
        }

        const project = await Project.findById(invite.projectId);
        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        if (project.members.some(m => m.userId.toString() === userId)) {
            return res.status(409).json({ message: 'Ya eres miembro del proyecto' });
        }

        project.members.push({
            userId,
            role: invite.role || 'colaborador'
        });

        await project.save();
        const projectId=invite.projectId;

        inviteCache.del(token);

        res.status(200).json({ message: 'Te has unido al proyecto correctamente', projectId: projectId});
    } catch (error) {
        res.status(500).json({ message: 'Error al aceptar la invitación', error });
    }
};
