import { pool } from "../../db.js";

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

    // Sprawdzamy, czy firma jest podrzędna
    // Firma główna nie może być usunięta przez to API
    if (!parent_company_id) {
      await connection.rollback();
      connection.release();
      return {
        message: "server.list_contractors.main_company_cannot_be_deleted",
        error: true,
        data: null,
      };
    }

    // Sprawdzamy, czy użytkownik ma odpowiednią rolę
    const allowedRoles = ['main_administrator', 'administrator'];
    if (!allowedRoles.includes(user_role)) {
      await connection.rollback();
      connection.release();
      return {
        message: "server.no_permissions",
        error: true,
        data: null,
      };
    }
    
    // Jeżeli użytkownik jest 'main_administrator' lub 'administrator',
    // sprawdzamy, czy firma, którą chce usunąć, należy do jego firmy
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