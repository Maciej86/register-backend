export const columnsConfigDataTable = (columns, selectedColumns) => {
  const columnsData =  columns.filter(column => selectedColumns.includes(column.field)).map(column => ({
    field: column.field,
    name: column.name,
    size: column.size,
    visible: column.visible,
    textAlign: column.textAlign,
    type: column.type
  }));

  const columnsWithBooleans = columnsData.map(column => ({
    ...column,
    visible: column.visible === 1
  })); 

  return selectedColumns.map(col => columnsWithBooleans.find(c => c.field === col));
};