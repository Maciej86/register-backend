export const columnsConfigDataTable = (columns, selectedColumns) => {
  const columnsData =  columns.filter(column => selectedColumns.includes(column.field)).map(column => ({
    field: column.field,
    name: column.name,
    size: column.size,
    visible: column.visible,
    textAlign: column.textAlign
  }));

  return selectedColumns.map(col => columnsData.find(c => c.field === col));
};