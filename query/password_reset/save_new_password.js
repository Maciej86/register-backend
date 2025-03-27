import { pool } from "../../db.js";

export const save_new_password = async (hashedPassword, email, table) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const result =  await connection.query(`UPDATE ${table} SET password = ? WHERE email = ?`, [hashedPassword, email]);
    await connection.query('DELETE FROM password_reset WHERE email = ?', [email]);

    await connection.commit();

    return {
      message: "server.login_app.password_reset_save_success",
      error: false,
      data: result
    };

  } catch (error) {
    return {
      message: "server.login_app.password_reset_save_error",
      error: true,
      data: error
    };
  }
};