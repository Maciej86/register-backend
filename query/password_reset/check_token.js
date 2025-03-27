import { pool } from "../../db.js";

export const check_token = async (token) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM password_reset WHERE token = ?`, [token]);

    if (rows.length === 0 || new Date(rows[0].expiration) < Date.now()) {
      return {
        message: "server.login_app.password_reset_token_incorrect",
        error: true,
        data: null
      };
    }

    return {
      message: "server.login_app.password_reset_token_success",
      error: false,
      data: {email: rows[0].email, table: rows[0].table_name}
    };

  } catch (error) {
    return {
      message: "server.login_app.password_reset_token_error",
      error: true,
      data: error
    };
  }
};