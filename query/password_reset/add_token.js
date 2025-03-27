import { pool } from "../../db.js";

export const add_token = async (email, passwordResetToken, expiration) => {
  const tables = [
    { name: "users" },
    { name: "personal_accounts" },
    { name: "system_users" }
  ];
  let user = null;
  let tablename = null;

  try {
    for (const { name } of tables) {
      const [rows] = await pool.query(`SELECT * FROM ${name} WHERE email = ?`, [email]);
      if (rows.length > 0) {
        user = rows[0];
        tablename = name;
        break;
      }
    }

    if(!user) {
      return {
        message: "server.login_app.password_reset_success",
        error: true,
        data: null
      };
    }

    await pool.query('INSERT INTO password_reset (email, token, expiration, table_name, created_at) VALUES (?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE token = ?, expiration = ?, table_name = ?, created_at =  NOW()', [email, passwordResetToken, expiration, tablename, passwordResetToken, expiration, tablename]);

    return {
      message: "server.login_app.password_reset_success",
      error: false,
      data: {userName: user.first_name}
    };

  } catch (error) {
    return {
      message: "server.login_app.password_reset_error",
      error: true,
      data: error
    };
  }
};