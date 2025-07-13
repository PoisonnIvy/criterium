import FormInstance from '../models/formInstance.js'

export default async function getPivotDataByProject(projectId) {
  const instances = await FormInstance.find({ projectId })
    .populate("baseFormId")
    .populate("articleId")
    .lean();

  return instances.map((instance) => {
    const fieldMap = {};
    const fields = instance.baseFormId?.fields || [];

    fields.forEach((field) => {
      fieldMap[field._id.toString()] = { label: field.label || "Campo sin nombre", type: field.type };
    });

    const row = {};

    instance.data.forEach((entry) => {
      const fieldInfo = fieldMap[entry.fieldId?.toString()] || { label: "Campo desconocido", type: "text" };
      let value = entry.value;

      // normalizar valores
      if (fieldInfo.type === "multiselect") {
        // array para multiselec
        value = Array.isArray(value) ? value : value ? [value] : [];
         row[fieldInfo.label] = value;
      } else if (typeof value === "boolean") {
        row[fieldInfo.label] = value ? "Sí" : "No";
      } else {
        row[fieldInfo.label] = value;
      }
    });

    row["Estado análisis"] = instance.analysisStatus;
    row["% completado"] = instance.completionPercentage;
    row["Artículo"] = instance.articleId?.title ?? "Sin título";

    return row;
  });
}
