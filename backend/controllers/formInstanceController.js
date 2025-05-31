import FormInstance from "../models/formInstance";

export const createFormInstance = async (req, res) => {
    const { projectId, articleId, baseFormId, data } = req.body;

    try {
        const newFormInstance = new FormInstance({
            projectId,
            articleId,
            baseFormId,
            data
        });

        await newFormInstance.save();
        res.status(201).json(newFormInstance);
    } catch (error) {
        res.status(500).json({ message: 'Error creating form instance', error });
    }
}

export const updateFormInstance = async (req, res) => {
    const { id } = req.params;
    const { data } = req.body;

    try {
        const formInstance = await FormInstance.findById(id);
        if (!formInstance) {
            return res.status(404).json({ message: 'Form instance not found' });
        }

        formInstance.data = data;
        formInstance.updateProgress(); // Update completion percentage
        await formInstance.save();

        res.status(200).json(formInstance);
    } catch (error) {
        res.status(500).json({ message: 'Error updating form instance', error });
    }
}
export const getFormInstanceById = async (req, res) => {
    const { id } = req.params;

    try {
        const formInstance = await FormInstance.findById(id);
        if (!formInstance) {
            return res.status(404).json({ message: 'Form instance not found' });
        }

        res.status(200).json(formInstance);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching form instance', error });
    }
}
export const getFormInstancesByProject = async (req, res) => {
    const { projectId } = req.params;

    try {
        const formInstances = await FormInstance.find({ projectId });
        res.status(200).json(formInstances);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching form instances', error });
    }
}

    