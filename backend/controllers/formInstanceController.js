import FormInstance from "../models/formInstance.js";

export const createFormInstance = async ({ projectId, articleId, baseFormId, assignmentId, data }) => {

    try {
        const newFormInstance = new FormInstance({
            projectId,
            articleId,
            baseFormId,
            assignmentId,
            data
        });

        await newFormInstance.save();
        return newFormInstance;
    } catch (error) {
        return null;
    }
}

export const editFormInstance = async (req, res) => {
    instance = req.instance;
    const { data } = req.body;
    const { status } = req.query;

    try {
        if (!instance) {
            return res.status(404).json({ message: 'Instancia de formulario no encontrada' });
        }
        if (status && status === 'completed') {
                instance.markAsCompleted();
                await instance.save();
                res.status(200).json(instance);
        }

        instance.data = data;
        instance.analysisStatus = 'in progress';
        instance.updateProgress();
        await instance.save();

        res.status(200).json(instance);
    } catch (error) {
        res.status(500).json({ message: 'Error al editar la instancia', error });
    }
}

export const getFormInstanceById = async (req, res) => {
    const instance= req.instance

    try {
        if (!instance) {
            return res.status(404).json({ message: 'Instancia no encontrada' });
        }

        res.status(200).json(instance);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la instancia', error });
    }
}

export const getAllInstances = async (req, res) => {
    const { projectId } = req.params;
    const { status } = req.query

    try {
        const formInstances = await FormInstance.find({ projectId, status })
                                                .populate({ path: 'articleId', select: 'title' })
                                                .populate({ path: 'assignmentId', select: 'reviewerId' });
        res.status(200).json(formInstances); 
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las instancias', error });
    }
}

