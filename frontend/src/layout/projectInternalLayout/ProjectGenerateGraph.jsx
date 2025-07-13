import { useEffect, useState } from "react";
import Box from "@mui/joy/Box";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Input from "@mui/joy/Input";
import Table from "@mui/joy/Table";
import Typography from "@mui/joy/Typography";
import { useProject } from "../../hooks/useProject";

const statusOptions = [
  { value: "", label: "Todos" },
  { value: "pendiente", label: "Pendiente" },
  { value: "en curso", label: "En curso" },
  { value: "completado", label: "Completado" },
];

const ProjectGenerateGraph = () => {
  const {baseform, instances} = useProject()
  const [fields, setFields] = useState([]);
  const [workInstances, setWorkInstances] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState({});

  useEffect(() => {

      setFields(baseform.fields || []);
      setWorkInstances(instances.data || []);
  }, [baseform, instances]);

  const filteredInstances = workInstances.filter((inst) => {
    return fields.every((field) => {
      const filterValue = columnFilters[field._id];
      if (!filterValue) return true;
      const dataItem = inst.data.find((d) => d.fieldId === field._id);
      if (!dataItem) return false;
      return String(dataItem.value)
        .toLowerCase()
        .includes(filterValue.toLowerCase());
    });
  });

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Typography level="h2" sx={{ mb: 2 }}>
        Visualización dinámica de datos
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Select
          value={statusFilter}
          onChange={(_, val) => setStatusFilter(val)}
          sx={{ minWidth: 200, mr: 2 }}
        >
          {statusOptions.map((opt) => (
            <Option key={opt.value} value={opt.value}>
              {opt.label}
            </Option>
          ))}
        </Select>
      </Box>
      <Table>
        <thead>
          <tr>
            {fields.map((field) => (
              <th key={field._id}>
                <Box>
                  <Typography level="body-sm">{field.label}</Typography>
                  <Input
                    size="sm"
                    placeholder={`Filtrar ${field.label}`}
                    value={columnFilters[field._id] || ""}
                    onChange={(e) =>
                      setColumnFilters((prev) => ({
                        ...prev,
                        [field._id]: e.target.value,
                      }))
                    }
                    sx={{ mt: 1 }}
                  />
                </Box>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredInstances.map((inst) => (
            <tr key={inst._id}>
              {fields.map((field) => {
                const dataItem = inst.data.find((d) => d.fieldId === field._id);
                return (
                  <td key={field._id}>
                    {dataItem ? String(dataItem.value) : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  );
};

export default ProjectGenerateGraph;

