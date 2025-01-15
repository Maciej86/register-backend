import { pool } from "../db.js";

export const password_reset_add_token = async (email, passwordResetToken, expiration) => {
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
        message: "server.password_reset_success",
        error: true,
        data: null
      };
    }

    await pool.query('INSERT INTO password_reset (email, token, expiration, table_name, created_at) VALUES (?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE token = ?, expiration = ?, table_name = ?, created_at =  NOW()', [email, passwordResetToken, expiration, tablename, passwordResetToken, expiration, tablename]);

    return {
      message: "server.password_reset_success",
      error: false,
      data: {userName: user.first_name}
    };

  } catch (error) {
    return {
      message: "server.password_reset_error",
      error: true,
      data: error
    };
  }
};

export const password_reset_check_token = async (token) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM password_reset WHERE token = ?`, [token]);

    if (rows.length === 0 || new Date(rows[0].expiration) < Date.now()) {
      return {
        message: "server.password_reset_token_incorrect",
        error: true,
        data: null
      };
    }

    return {
      message: "server.password_reset_token_success",
      error: false,
      data: {email: rows[0].email, table: rows[0].table_name}
    };

  } catch (error) {
    return {
      message: "server.password_reset_token_error",
      error: true,
      data: error
    };
  }
};

export const password_reset_save = async (hashedPassword, email, table) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const result =  await connection.query(`UPDATE ${table} SET password = ? WHERE email = ?`, [hashedPassword, email]);
    await connection.query('DELETE FROM password_reset WHERE email = ?', [email]);

    await connection.commit();

    return {
      message: "server.password_reset_save_success",
      error: false,
      data: result
    };

  } catch (error) {
    return {
      message: "server.password_reset_save_error",
      error: true,
      data: error
    };
  }
};