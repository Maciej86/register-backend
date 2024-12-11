import { pool } from "../db.js";

export const allusers = async () => {
  const [users] = await pool.query(`SELECT * FROM users`);

  return {
    message: "Użytkownicy",
    error: false,
    data: users
  };
};

export const register_system_user = async (username, hashedPassword) => {
  const [user] = await pool.query(
    "INSERT INTO system_users (first_name, last_name, email, password_hash, system_user_role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 'developer', true, NOW(), NOW())",
    ["Maciej", "Rościszewski", username, hashedPassword]);

    return {
      message: "Użytkownik dodany",
      error: false,
      data: user
    };
}