import { pool } from "../db.js";

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