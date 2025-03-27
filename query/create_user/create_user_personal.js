import { pool } from "../../db.js";

export const create_user_personal = async (first_name, last_name, email, hashedPassword, verificationToken) => {
  try{
    const [rows] = await pool.query(
      "SELECT email FROM personal_accounts WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      return {
        message: "server.email_already_exists",
        error: true,
        data: null
      };
    }

    const result = await pool.query(
      `INSERT INTO personal_accounts (first_name, last_name, email, password, theme, created_at, verification_token, updated_at, is_verified) VALUES (?, ?, ?, ?, "defaultTheme", false, ?, NOW(), NOW())`,
      [first_name, last_name, email, hashedPassword, verificationToken]);

    return {
      message: "server.login_app.create_account_ok",
      error: false,
      data: result
    };
  } catch (error) {
    return {
      message: "server.login_app.create_account_error",
      error: true,
      data: error
    };
  }
};