import { pool } from "../db.js";

export const allusers = async () => {
  const [users] = await pool.query(`SELECT * FROM users`);

  return {
    message: "Użytkownicy",
    error: false,
    data: users
  };
};