import { pool } from "../../db.js";
import { columnsConfigDataTable } from "../../columnsConfigDataTable.js";

export const companies = async (companyId, selectedColumns) => {
  const companiesQuery = `
    SELECT 
      c.id, c.name, c.tax_identification_number, c.zip_code, 
      c.city, c.address, c.parent_company_id, c.created_at, c.updated_at,
      u.id AS manager_id,
      u.first_name AS manager_first_name,
      u.last_name AS manager_last_name,
      u.phone_number AS manager_phone_number,
      u.email AS manager_email,
      (SELECT COUNT(*) FROM users WHERE company_id = c.id) AS total_employees
    FROM companies c
    LEFT JOIN users u ON c.id = u.company_id AND u.user_role = 'manager'
    WHERE c.parent_company_id = ? ORDER BY c.created_at DESC;
  `;

  const accountantsQuery = `
    SELECT 
      aa.client_company_id AS company_id,
      acc.id AS accountant_id,
      acc.first_name,
      acc.last_name
    FROM accounting_assignments aa
    JOIN users acc ON aa.accountant_id = acc.id
    WHERE acc.user_role = 'accountant' 
    AND aa.client_company_id IN (
      SELECT id FROM companies WHERE parent_company_id = ?
    );
  `;

  const columnsQuery = `SELECT * FROM columns_config`;

  const connection = await pool.getConnection();
  try {
    const [companies] = await connection.query(companiesQuery, [companyId]);
    const [accountants] = await connection.query(accountantsQuery, [companyId]);
    const [columns] = await connection.query(columnsQuery);
    connection.release();

    if(companies.length === 0) {
      return {
        message: "list_contractors.empty_list_contractors",
        error: false,
        data: null
      };
    }

    const companiesWithAccountants = companies.map(company => {
      return {
        id: company.id,
        name: company.name,
        tax_identification_number: company.tax_identification_number,
        zip_code: company.zip_code,
        city: company.city,
        address: company.address,
        parent_company_id: company.parent_company_id,
        created_at: company.created_at,
        updated_at: company.updated_at,
        total_employees: company.total_employees,
        manager: company.manager_id ? {
          id: company.manager_id,
          first_name: company.manager_first_name,
          last_name: company.manager_last_name,
          phone: company.manager_phone_number,
          email: company.manager_email
        } : null,
        accountants: accountants
          .filter(acc => acc.company_id === company.id)
          .map(acc => ({
            id: acc.accountant_id,
            first_name: acc.first_name,
            last_name: acc.last_name
          }))
      };
    });

    const rows = companiesWithAccountants.map(company => ({
      id: company.id,
      name_company: company.name,
      tax_identification_number: company.tax_identification_number,
      zip_code: company.zip_code,
      city: company.city,
      address: company.address,
      total_employees: company.total_employees,
      manager_child_company:`${company.manager.first_name} ${company.manager.last_name}`,
      phone: company.manager.phone,
      email: company.manager.email,
      accountants: company.accountants.map(acc => `${acc.first_name} ${acc.last_name}`).join(", "),
      created_at:  company.created_at
    }));

    const columnsConfig = columnsConfigDataTable(columns, selectedColumns);

    return {
      message: "list_contractors.fetch_list_success",
      error: false,
      data: { columns: columnsConfig, rows: rows }
    };

  } catch (error) {
    console.log(error);
    return {
      message: "server.data_fetch_error",
      error: true,
      data: error
    };
  };
};