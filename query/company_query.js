import { pool } from "../db.js";

export const companies = async (companyId, selectedColumns) => {
  const companiesQuery = `
    SELECT 
      c.id, c.name, c.tax_identification_number, c.zip_code, 
      c.city, c.address, c.parent_company_id, c.created_at, c.updated_at,
      u.id AS manager_id,
      u.first_name AS manager_first_name,
      u.last_name AS manager_last_name,
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
      name: company.name,
      tax_identification_number: company.tax_identification_number,
      zip_code: company.zip_code,
      city: company.city,
      address: company.address,
      total_employees: company.total_employees,
      manager_child_company:`${company.manager.first_name} ${company.manager.last_name}`,
      accountants: company.accountants.map(acc => `${acc.first_name} ${acc.last_name}`).join(", "),
      created_at:  company.created_at
    }));

    const columnsConfig = columns.filter(column => selectedColumns.includes(column.field)).map(column => ({
      field: column.field,
      nazwa: column.name,
      size: column.size,
      visible: column.visible,
      textAlign: column.textAlign
    }));

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

export const company_accountants = async (companyId) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        u.id AS accountant_id,
        u.first_name,
        u.last_name,
        GROUP_CONCAT(c.name SEPARATOR ', ') AS company_names
      FROM users u
      LEFT JOIN accounting_assignments a ON u.id = a.accountant_id
      LEFT JOIN companies c ON a.client_company_id = c.id
      WHERE u.user_role = 'accountant'
        AND u.company_id = ?
      GROUP BY u.id, u.first_name, u.last_name
      `,
      [companyId]
    );

    return {
      message: rows.length > 0 ? "server.add_contractors.list_accountants" : "server.add_contractors.empty_accountants",
      error: false,
      data: rows
    };
  } catch (error) {
    return {
      message: "server.data_fetch_error",
      error: true,
      data: error
    };
  };
};

export const add_company = async (first_name, last_name, email, phone, name_company, tin, zip_code, city, address, parent_company_id) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [emailRow] = await connection.query(
      "SELECT email FROM users WHERE email = ?",
      [email]
    );

    if (emailRow.length > 0) {
      connection.release();
      return {
        message: "server.email_already_exists",
        error: true,
        data: null
      };
    }

    const [rows] = await connection.query(
      `SELECT 
        p.id AS parent_id,
        p.name AS parent_name,
        pl.name AS plan_name,
        pl.max_companies,
        COUNT(c.id) AS created_companies
      FROM companies p
      JOIN plans pl ON p.subscription_plan = pl.name
      LEFT JOIN companies c ON c.parent_company_id = p.id
      WHERE p.id = ?
      GROUP BY p.id, p.name, pl.name, pl.max_companies;`,
      [parent_company_id]
    );

    if (rows.length === 0) {
      connection.release();
      return {
        message: "server.company_not_exists",
        error: true,
        data: null
      };
    }

    const { max_companies, created_companies } = rows[0];

    if (max_companies !== null && created_companies >= max_companies) {
      connection.release();
      return {
        message: "server.limit_used",
        error: true,
        data: null
      }
    }

    const [resultCompany] = await connection.query(
      `INSERT INTO companies (name, tax_identification_number, zip_code, city, address, parent_company_id, subscription_plan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, "Basic", NOW(), NOW())`,
      [name_company, tin, zip_code, city, address, parent_company_id]);

    const idCompany = resultCompany.insertId;

    const [resultUser] = await connection.query(
      `INSERT INTO users (company_id, first_name, last_name, email, password, theme, phone_number, address_street, address_city, address_postal_code, user_role, bookkeeping, employment_date, user_status, contract_type, vacation_days, medical_exam_date, hourly_rate, monthly_rate, is_verified, verification_token, created_at, updated_at) VALUES (?, ?, ?, ?, NULL, "defaultTheme", ?, NULL, NULL, NULL, "manager", false, NULL, true, NULL, NULL, NULL, NULL, NULL, false, NULL, NOW(), NOW())`,
      [idCompany, first_name, last_name, email, phone]);

    await connection.commit();
    connection.release();

    return {
      message: "server.add_contractors.add_child_company",
      error: false,
      data: null
    }
  } catch (error) {
    await connection.rollback();
    connection.release();

    return {
      message: "server.add_contractors.add_contractors_error",
      error: true,
      data: error
    };
  };
};

