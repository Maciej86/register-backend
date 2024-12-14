import { pool } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login_user = async (login, password) => {
  try{
    const [rows] = await pool.query("SELECT * FROM system_users WHERE email = ?", [login]);

    if (rows.length === 0) {
      return {
        message: "Nieprawidłowe dane logowania",
        error: true,
        data: null
      };
    }
    
    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        message: "Nieprawidłowe dane logowania",
        error: true,
        data: null
      };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return {
      message: "Użytkownik zalogowany",
      error: false,
      data: [token]
    };
  } catch (error) {
    return {
      message: "Wystąpił błąd podczas logowania użytkownika",
      error: true,
      data: null
    };
  }
}