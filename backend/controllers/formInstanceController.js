import FormInstance from "../models/formInstance.js";
import  flatData  from "../services/flatInstances.js";

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
    const instance = req.instance;
    const userId = req.session.userId;
    const { data } = req.body;
    const { status } = req.query;

    try {
        if (!instance) {
            return res.status(404).json({ message: 'Instancia de formulario no encontrada' });
        }
        if (status && status === 'completado') {
                instance.markAsCompleted();
        } else instance.analysisStatus = 'en curso';
        instance.data = data;
        instance.data = data.map(d => ({
                ...d,
                extractedBy: userId
            }));
        instance.updateProgress();
        await instance.save();

        res.status(200).json(instance);
    } catch (error) {
        res.status(500);
    }
}

export const getFormInstanceById = async (req, res) => {
    const instance= req.instance
    try {
        if (!instance) {
            return res.status(404).json({ message: 'Instancia no encontrada' });
        }
        instance.updateProgress();
        await instance.save();
        res.status(200).json(instance);
    } catch (error) {
        res.status(500);
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


export const getTableData = async (req, res) => {
    try {
        const { projectId } = req.params;
        const data = await flatData(projectId);
        return res.status(200).json(data);
    } catch (err) {
        console.error("Error al obtener datos para pivottable", err);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}

