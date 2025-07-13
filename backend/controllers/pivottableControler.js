import getPivotDataByProject  from "../services/pivottablePipeline.js";

export default async function getPivotData(req, res) {
  try {
    const { projectId } = req.params;
    const data = await getPivotDataByProject(projectId);
    res.json(data);
  } catch (err) {
    console.error("Error al obtener datos para pivottable", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}