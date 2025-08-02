export function transformToCSV(instances, fields) {
  return instances.map((inst) => {
    return fields.map((field) => {
      const dataItem = inst.data.find((d) => d.fieldId === field._id);
      return dataItem ? dataItem.value : "";
    });
  });
}