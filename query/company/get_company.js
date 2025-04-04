import { pool } from "../../db.js";
import { checkUserRole } from "../../authorization/checkUserRole.js";

export const get_company = async (company_id, user_company_id, user_role) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [company] = await connection.query(
      "SELECT id, parent_company_id FROM companies WHERE id = ?", 
      [company_id]
    );

    if (company.length === 0) {
      await connection.rollback();
      connection.release();
      return {
        message: "server.company_not_exists",
        error: true,
        data: null,
      };
    }

    if (company[0].parent_company_id !== user_company_id) {
      await connection.rollback();
      connection.release();
      return {
        message: "server.no_permissions",
        error: true,
        data: null,
      };
    }

    const roleCheck = await checkUserRole(user_role, ["main_administrator", "administrator"], connection);
    if (roleCheck) {
      return roleCheck
    };

    const [companyDetails] = await connection.query(
      `
      SELECT 
        c.id, c.name AS name_company,
        c.tax_identification_number AS tin,
        c.zip_code, c.city, c.address,
        u.first_name, u.last_name, u.email,
        u.phone_number AS phone
      FROM companies c
      LEFT JOIN users u 
        ON u.company_id = c.id AND u.user_role = 'admin_child_company'
      WHERE c.id = ? AND c.parent_company_id = ?
      `,
      [company_id, user_company_id]
    );

    await connection.commit();
    connection.release();

    const data = {
      id: companyDetails[0].id,
      first_name: companyDetails[0].first_name || null,
      last_name: companyDetails[0].last_name || null,
      email: companyDetails[0].email || null,
      phone: companyDetails[0].phone || null,
      name_company: companyDetails[0].name_company,
      tin: companyDetails[0].tin,
      zip_code: companyDetails[0].zip_code,
      city: companyDetails[0].city,
      address: companyDetails[0].address,
    };

    return {
      message: "Pobrano dane",
      error: false,
      data: data,
    };

  } catch (error) {
    await connection.rollback();
    connection.release();

    return {
      message: "server.delete_error",
      error: true,
      data: error,
    };
  }
}