/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo } from "react";
import Box from "@mui/joy/Box";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Input from "@mui/joy/Input";
import Table from "@mui/joy/Table";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { useProject } from "../../hooks/useProject";
import { useParams } from "react-router-dom";

import Pie from "../../components/Pie";
import Barra from "../../components/Bar";
import Tabla from "../../components/Tabla";


const graphOptions = [
  { value: "table", label: "Tabla" },
  { value: "bar", label: "Gráfico de barras" },
  { value: "pie", label: "Gráfico de torta" },
];

const ProjectGenerateGraph = () => {
  const {projectId} = useParams()
  const {baseform, instances, flatInstances, fetchFlatInstances} = useProject()
  const [fields, setFields] = useState([]);


  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);


  const [selectedTableFields, setSelectedTableFields] = useState([]);
  const [selectedBarField, setSelectedBarField] = useState(""); 
  const [selectedPieField, setSelectedPieField] = useState(""); 

  const [graphType, setGraphType] = useState("");
  const [generate, setGenerate] = useState(false);


  useEffect(() => {
    fetchFlatInstances(projectId);
    const fieldLabels = (baseform.fields || []).map(f => f.label);
    setColumns(fieldLabels);
    setRows(flatInstances.rows || []); //array de obj, filas
    setFields(baseform.fields || []);
  }, [baseform, instances, projectId, flatInstances]);

  // table data
const extraColumns = ["articulo", "estado", "porcentajeCompletado"];

const tableColumns = useMemo(() => {
  const selected = selectedTableFields.length > 0 ? selectedTableFields : fields.map(f => f.label);
  return [...extraColumns, ...selected];
}, [selectedTableFields, fields]);


const tableRows = useMemo(() => {
  if (!Array.isArray(rows) || !Array.isArray(fields)) return [];
  return rows.map(row => {
    const result = {};

    result["articulo"] = row["articulo"] ?? "";
    result["estado"] = row["estado"] ?? "";
    result["porcentajeCompletado"] = row["porcentajeCompletado"] ?? "";

    tableColumns.forEach(label => {
      if (extraColumns.includes(label)) return;
      const field = fields.find(f => f.label === label);
      if (!field) {
        result[label] = "";
        return;
      }
      if (field.type === "multiselect") {
        const selectedOptions = (field.options || [])
          .filter(opt => row[`${field.label}:${opt}`] && String(row[`${field.label}:${opt}`]).toLowerCase() === "x");
        result[label] = selectedOptions.length > 0 ? selectedOptions.join(", ") : "";
      } else {
        result[label] = row[label] !== undefined ? row[label] : "";
      }
    });
    return result;
  });
}, [rows, fields, tableColumns]);

// bar data
  const barData = useMemo(() => {
    if (!selectedBarField) return [];
    const field = fields.find(f => f.label === selectedBarField);
    if (!field) return [];
    if (field.type === 'multiselect') {
      const optionCounts = {};
      (field.options || []).forEach(opt => { optionCounts[opt] = 0; });
      rows.forEach((row) => {
        (field.options || []).forEach(opt => {
          const colKey = `${selectedBarField}:${opt}`;
          if (row[colKey] && String(row[colKey]).toLowerCase() === 'x') {
            optionCounts[opt] = (optionCounts[opt] || 0) + 1;
          }
        });
      });
      return Object.entries(optionCounts).map(([key, value]) => ({ label: key, value }));
    } else {
      const counts = {};
      rows.forEach((row) => {
        const val = row[selectedBarField] || "Sin dato";
        counts[val] = (counts[val] || 0) + 1;
      });
      return Object.entries(counts).map(([key, value]) => ({ label: key, value }));
    }
  }, [selectedBarField, fields, rows]);

// pie data

  const pieData = useMemo(() => {
    if (!selectedPieField) return [];
    const field = fields.find(f => f.label === selectedPieField);
    if (!field) return [];
    if (field.type === 'multiselect') {
      const optionCounts = {};
      (field.options || []).forEach(opt => { optionCounts[opt] = 0; });
      rows.forEach((row) => {
        (field.options || []).forEach(opt => {
          const colKey = `${selectedPieField}:${opt}`;
          if (row[colKey] && String(row[colKey]).toLowerCase() === 'x') {
            optionCounts[opt] = (optionCounts[opt] || 0) + 1;
          }
        });
      });
      return Object.entries(optionCounts).map(([key, value]) => ({ label: key, value }));
    } else {
      const counts = {};
      rows.forEach((row) => {
        const val = row[selectedPieField] || "Sin dato";
        counts[val] = (counts[val] || 0) + 1;
      });
      return Object.entries(counts).map(([key, value]) => ({ label: key, value }));
    }
  }, [selectedPieField, fields, rows]);



  const handleDownloadCSV = () => {
    if (!flatInstances || !flatInstances.columns || !flatInstances.rows) return;
    const csvHeader = flatInstances.columns.join(";");
    const csvRows = flatInstances.rows.map(row =>
      flatInstances.columns.map(col => {
        const cell = row[col] !== undefined ? row[col] : "";
        return `"${String(cell).replace(/"/g, '""')}"`;
      }).join(";")
    );
    const BOM = "\uFEFF";
    const csvContent = [csvHeader, ...csvRows].join("\n");
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Stack direction="row" spacing={2} sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2 sx={{ mb: 2 }}>
        Visualización dinámica de datos
      </h2>
      <Button onClick={handleDownloadCSV}>Descargar data en CSV</Button>
      </Stack>

      <Box 
            spacing={2} 
            gap={5} 
            sx={{ display:'flex',
                  flexDirection:'row',
                  alignItems:'center'}}
      >
        <Stack direction='column'>
        <Typography>Selecciona un tipo de gráfico</Typography>
        <Select
          value={graphType}
          placeholder="Selecciona un gráfico"
          onChange={(_, val) => {setGraphType(val); setGenerate(false)}}
          sx={{ minWidth: 200, mr: 2, background: '#4f2621', color: 'white', '&:hover': { background: '#3e1f1c' }}} 
        >
          {graphOptions.map((opt) => (
            <Option key={opt.value} value={opt.value}>
              {opt.label}
            </Option>
          ))}
        </Select>
        </Stack>


        <Box
          gap={2}
          sx={{ display: 'flex', flexDirection: 'row', mt: 2, mb: 2}}
        >


          {/* Selector de campos para TABLA */}
          {graphType === "table" && (
            <Stack direction='column' spacing={2}>
              <Typography>Selecciona los campos para mostrar en la tabla</Typography>
              <Select
                multiple
                placeholder="Todos"
                value={selectedTableFields}
                onChange={(_, val) => {
                  setSelectedTableFields(val)
                  setGenerate(false)
                }}
                sx={{ minWidth: 200 }}
              >
                {columns.map(col => (
                  <Option key={col} value={col}>{col}</Option>
                ))}
              </Select>
            </Stack>
          )}


          {/* Selector de campo para BARRA */}
          {graphType === "bar" && (
            <Stack direction='column' spacing={2}>
              <Typography>Selecciona el campo para agrupar (barra)</Typography>
              <Select
                value={selectedBarField}
                placeholder="Selecciona un campo"
                onChange={(_, val) => {
                  setSelectedBarField(val)
                  setGenerate(false)
                }}
                sx={{ minWidth: 200 }}
              >
                {columns.map(col => (
                  <Option key={col} value={col}>{col}</Option>
                ))}
              </Select>
            </Stack>
          )}

          {/* Selector de campo para PIE */}
          {graphType === "pie" && (
            <Stack direction='column' spacing={2}>
              <Typography>Selecciona el campo para agrupar (pie)</Typography>
              <Select
                value={selectedPieField}
                placeholder="Selecciona un campo"
                onChange={(_, val) => {
                  setSelectedPieField(val)
                  setGenerate(false)
                }}
                sx={{ minWidth: 200 }}
              >
                {columns.map(col => (
                  <Option key={col} value={col}>{col}</Option>
                ))}
              </Select>
            </Stack>
          )}

        </Box>
        {graphType!=='' && <Button
          onClick={() => { setGenerate(true)}}
          sx={{ backgroundColor: '#b56a65',
                color: 'white', '&:hover': { backgroundColor: '#b56a65' }}} 
        >
          Generar gráfico </Button>}
      </Box>


      <Divider  sx={{ borderColor: 'black', mt:3}} />

      {generate && (
          <span style={{ marginTop: '10px', display: 'block' }}>
            Total de instancias: {rows.length} filas <br />
          </span>
        )}

      <Box 
      spacing={2}
      gap={4}
      sx={{ mt: 5,
            p: 2, display:'flex', 
            alignItems:'center', 
            flexDirection:'column',
              }}>
        {/* componentes de graficos */}
        
        {graphType === 'table' && generate && (
          <Tabla rows={tableRows} columns={tableColumns} />
        )}
        {graphType === 'bar' && generate && (
          <Barra data={barData} field={selectedBarField} />
        )}
        {graphType === 'pie' && generate && (
          <Pie data={pieData}/>
        )}

      </Box>

    </Box>
  );
};

export default ProjectGenerateGraph;


