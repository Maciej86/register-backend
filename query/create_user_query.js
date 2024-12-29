import { pool } from "../db.js";

export const create_user_personal = async (first_name, last_name, email, hashedPassword, verificationToken) => {
  try{
    const result = await pool.query(
      "INSERT INTO personal_accounts (first_name, last_name, email, password, created_at, updated_at, is_verified, verification_token) VALUES (?, ?, ?, ?, NOW(), NOW(), false, ?)",
      [first_name, last_name, email, hashedPassword, verificationToken]);

    return {
      message: "server.create_account_ok",
      error: false,
      data: result
    };
  } catch (error) {
    return {
      message: "server.create_account_error",
      error: true,
      data: error
    };
  }
};