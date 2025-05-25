import Project from '../models/Project.js';

export const createProject = async (req, res) => {
    const { name, description, status, leadInvestigator, colaborators, articles, baseForm, assignments } = req.body;

    try {
        const newProject = new Project({
            name,
            description,
            status,
            leadInvestigator,
            colaborators,
            articles,
            baseForm,
            assignments,
        });

        await newProject.save();
        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({ message: 'Error creating project', error });
    }
}

export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects', error });
    }
}

export const getProjectById = async (req, res) => {
    const { id } = req.params;

    try {
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }   
        res.status(200).json(project);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching project', error });
    }
}

export const updateProject = async (req, res) => {
    const { id } = req.params;
    const { name, description, startDate, endDate } = req.body;

    try {
        const updatedProject = await Project.findByIdAndUpdate(
            id,
            { name, description},
            { new: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.status(200).json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: 'Error updating project', error });
    }
}   

export const disableProject = async (req, res) => {
    const { id } = req.params;

    try {
        const disabledProject = await Project.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!disabledProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.status(200).json(disabledProject);
    } catch (error) {
        res.status(500).json({ message: 'Error disabling project', error });
    }
}
export const enableProject = async (req, res) => {
    const { id } = req.params;

    try {
        const enabledProject = await Project.findByIdAndUpdate(
            id,
            { isActive: true },
            { new: true }
        );

        if (!enabledProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.status(200).json(enabledProject);
    } catch (error) {
        res.status(500).json({ message: 'Error enabling project', error });
    }
}
export const deleteProject = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedProject = await Project.findByIdAndDelete(id);

        if (!deletedProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting project', error });
    }
}
export const getActiveProjects = async (req, res) => {
    try {
        const activeProjects = await Project.find({ isActive: true });
        res.status(200).json(activeProjects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching active projects', error });
    }
}
export const getInactiveProjects = async (req, res) => {
    try {
        const inactiveProjects = await Project.find({ isActive: false });
        res.status(200).json(inactiveProjects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inactive projects', error });
    }
}
