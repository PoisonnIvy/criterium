import BaseForm from "../models/baseForm.js";
import FormInstance from "../models/formInstance.js";


export default async function flatData(projectId) {

    const baseForm = await BaseForm.findOne({ projectId }).lean();
    if (!baseForm) return("No se encontro el formulario base");


    let columns = ["articulo","porcentajeCompletado", "estado"];
    const fieldColumnMap = {};
    baseForm.fields.forEach(field => {
        if (field.type === "multiselect" && Array.isArray(field.options)) {
            fieldColumnMap[field._id] = field.options.map(opt => `${field.label}:${opt}`);
            columns.push(...fieldColumnMap[field._id]);
        } else {
            fieldColumnMap[field._id] = [field.label];
            columns.push(field.label);
        }
    });

    const formInstances = await FormInstance.find({ projectId }).populate("articleId", "title").lean();


    const rows = formInstances.map(instance => {
        const row = {
            articulo: instance.articleId.title,
            porcentajeCompletado: instance.completionPercentage,
            estado: instance.analysisStatus
        };
        // mapea fieldId to value
        const dataMap = {};
        (instance.data).forEach(d => {
            dataMap[d.fieldId.toString()] = d.value;
        });

        baseForm.fields.forEach(field => {
            const fieldId = field._id.toString();
            const value = dataMap[fieldId];
            if (field.type === "multiselect" && Array.isArray(field.options)) {
                field.options.forEach(opt => {
                    row[`${field.label}:${opt}`] = Array.isArray(value) && value.includes(opt) ? "x" : "";
                });
            } else if (field.type === "boolean") {
                row[field.label] = value ? "si" : "no";
            } else if (field.type === "date") {
                row[field.label] = value ? new Date(value).toLocaleDateString() : "";
            } else {
                row[field.label] = ![null, undefined].includes(value) ? value : "";
            }
        });
        return row; //retorna la fila completa con la info, por cada intance
    });
    return { columns, rows }; 
    // column es un array con los nombres
    // rows es un arrays de objectos, cada objeto es una fila con los datos
}

