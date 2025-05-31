import BaseForm from '../models/baseForm.js';

// FUNCION PARA CREAR UN FORMULARIO BASE
export const createBaseForm = async (req, res) => {
    const { fields, projectID } = req.body;
    const [{ fieldName, fieldType, fieldOptions }] = fields;

    try {
        const newBaseForm = new BaseForm({
            projectID,
            fields:[{fieldName, fieldType, fieldOptions}],

        });

        await newBaseForm.save();
        res.status(201).json(newBaseForm);
    } catch (error) {
        res.status(500).json({ message: 'Error creating base form', error });
    }
}

// FUNCION PARA OBTENER TODOS LOS FORMULARIOS BASE ???? para que es esto xd no le veo sentido poder obtener todos los formularios base
export const getBaseForms = async (req, res) => {
    try {
        const BaseForms = await BaseForm.find();
        res.status(200).json(BaseForms);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching base forms', error });
    }
}

//FUNCION PARA BUSCAR UN FORMULARIO BASE POR ID
export const getBaseFormById = async (req, res) => {
    const { id } = req.params;

    try {
        const BaseForm = await BaseForm.findById(id);
        if (!BaseForm) {
            return res.status(404).json({ message: 'Base form not found'})
        }
        res.status(200).json(BaseForm);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching base form', error });
    }
}

// FUNCION PARA ACTUALIZAR UN FORMULARIO BASE
export const updateBaseForm = async (req, res) => {
    const { id, version } = req.params; // COMES FROM THE URL
    const { fields, updatedBy,} = req.body;
    const [{ fieldName, fieldType, fieldOptions }] = fields;

    try {
        const updatedBaseForm = await BaseForm.findByIdAndUpdate(
            id,
            {
            fields:[{fieldName, fieldType, fieldOptions}],
            version: (version + 1),
            updatedBy,
            status: "free",
            isActive: true,
            },
            { new: true }
        );
        if (!updatedBaseForm) {
            return res.status(404).json({ message: 'Base form not found'})
        }
        res.status(200).json(updatedBaseForm);
    } catch (error) {
        res.status(500).json({ message: 'Error updating base form', error });
    }
}

//FUNCION PARA CAMBIAR EL ESTADO CUANDO SE EDITA EL FORM BASE. para evitar ediciones simultaneas
export const setEditingStatus = async (req, res) =>{
    const { id } = req.params;

    try {
        const setEditing = await BaseForm.findByIdAndUpdate(
            id,
            {
                status : "editing",
                isActive : false,
            },

            {new: true}
        );
        if(!setEditing){
            return res.status(404).json({ message: 'Base form not found'})
        }
        res.status(418).json({message: 'Set Editing Status'}, setEditing)
    } catch (error) {
        
    }
}

