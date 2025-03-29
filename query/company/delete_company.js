import { pool } from "../../db.js";
// import { checkUserRole } from "../../authorization/checkUserRole.js";

export const delete_company = async (company_id, user_company_id, user_role) => {
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

    const { parent_company_id } = company[0];

    // Checking if the company is a subsidiary
    // The main company cannot be deleted through this API
    if (!parent_company_id) {
      await connection.rollback();
      connection.release();
      return {
        message: "server.list_contractors.main_company_cannot_be_deleted",
        error: true,
        data: null,
      };
    }

    const roleCheck = await checkUserRole(user_role, ["main_administrator", "administrator"], connection);
    if (roleCheck) {
      return roleCheck
    };
    
    // If the user is 'main_administrator' or 'administrator',
    // we check if the company they want to delete belongs to their company
    if (user_company_id !== parent_company_id) {
      await connection.rollback();
      connection.release();
      return {
        message: "server.no_permissions",
        error: true,
        data: null,
      };
    }

    const [deleteUser] = await connection.query("DELETE FROM users WHERE company_id = ?", [company_id]);
    const [result] = await connection.query("DELETE FROM companies WHERE id = ?", [company_id]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      connection.release();
      return {
        message: "server.company_not_exists",
        error: true,
        data: null,
      };
    }

    await connection.commit();
    connection.release();

    return {
      message: "server.list_contractors.company_deleted_successfully",
      error: false,
      data: {id: company_id, deleteUserCount: deleteUser.affectedRows},
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
};