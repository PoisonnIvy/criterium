import { fromZoteroItem } from "../services/importers/zoteroImporter.js";
import { fromWosText } from "../services/importers/wosImporter.js";
import { fromExcelBuffer } from "../services/importers/excelImporter.js";
import { fromCsvBuffer } from "../services/importers/csvImporter.js";

export async function handleImport(req, res) {
  const { sourceType } = req.body; // puede ser 'zotero', 'wos', 'csv', 'excel'
  try {
    let articles = [];

    if (sourceType === 'zotero') {
      const items = req.body.items;
      if (!Array.isArray(items)) throw new Error("Zotero: items debe ser un array");
      articles = items.map(fromZoteroItem);
    }

if (sourceType === 'wos') {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No se adjuntó ningún archivo." });
  }

  const text = req.file.buffer.toString('utf-8');
  articles = fromWosText(text);
}

    if (sourceType === 'csv' || sourceType === 'excel') {
      const fileBuffer = req.file.buffer;
      if (sourceType === 'excel') {
        articles = fromExcelBuffer(fileBuffer);
      } else {
        articles = fromCsvBuffer(fileBuffer);
      }
    }

    res.json({ success: true, articles });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
}
