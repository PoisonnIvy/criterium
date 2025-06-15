import FormInstance from "../models/formInstance";
import Assignment from "../models/assignment";

export const instanceAccess = (action) => async (req, res, next) => {
    const { projectId, instanceId, articleId } = req.params;
    const userId = req.session.userId;

    if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required' });
    }

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if the user has access to the project
    const project = await Project.findById(projectId);
    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }

    const userRole = project.getUserRole(userId);
    if (!userRole) {
        return res.status(403).json({ message: 'No access to this project' });
    }

    // Check if the user has the required role for the action
    const roleList = action.roleList || [];
    if (roleList.length && !roleList.includes(userRole)) {
        return res.status(403).json({ message: 'Insufficient permissions for this action' });
    }

    // Fetch the form instance if instanceId is provided
    if (instanceId) {
        const instance = await FormInstance.findById(instanceId);
        if (!instance || instance.projectId.toString() !== projectId) {
            return res.status(404).json({ message: 'Form instance not found or does not belong to this project' });
        }
        req.instance = instance;
    }

    // Fetch the article if articleId is provided
    if (articleId) {
        const article = await Article.findById(articleId);
        if (!article || article.projectId.toString() !== projectId) {
            return res.status(404).json({ message: 'Article not found or does not belong to this project' });
        }
        req.article = article;
    }

    
    next();
}