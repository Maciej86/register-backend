import { pool } from "../../db.js";

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