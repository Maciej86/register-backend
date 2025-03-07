export const columnsConfigDataTable = (columns, selectedColumns) => {
  return columns.filter(column => selectedColumns.includes(column.field)).map(column => ({
    field: column.field,
    nazwa: column.name,
    size: column.size,
    visible: column.visible,
    textAlign: column.textAlign
  }));
};