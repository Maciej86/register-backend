import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

export const login_user = async (login, password) => {
  const tables = [
    { name: "system_users", role: "system" },
    { name: "personal_accounts", role: "personal" },
    { name: "users", role: "user" }
  ];
  let user = null;
  let userRole = null;

  try{
    for (const { name, role } of tables) {
      const [rows] = await pool.query(`SELECT * FROM ${name} WHERE email = ?`, [login]);
      if (rows.length > 0) {
        user = rows[0];
        userRole = role;
        break;
      }
    }

    if (!user) {
      return {
        message: "Nieprawidłowe dane logowania",
        error: true,
        data: null
      };
    }
    

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        message: "Nieprawidłowe dane logowania",
        error: true,
        data: null
      };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: userRole },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const keysToExclude = ["password", "created_at", "updated_at"];
    const filteredUser = Object.fromEntries(
      Object.entries(user).filter(([key]) => !keysToExclude.includes(key))
    );
    
    const dataSend = {
      token: token,
      user: filteredUser
    }

    return {
      message: "Użytkownik zalogowany",
      error: false,
      data: dataSend
    };
  } catch (error) {
    return {
      message: "Wystąpił błąd podczas logowania użytkownika",
      error: true,
      data: null
    };
  }
};

export const user_refresh = async (header) => {
  const token = header.headers.authorization?.split(" ")[1];
  if (!token) {
    return { message: "Brak tokenu", error: true, data: null };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tables = [
      { name: "system_users", role: "admin" },
      { name: "personal_accounts", role: "personal" },
      { name: "users", role: "user" }
    ];
    let user = null;

    for (const { name } of tables) {
      const [rows] = await pool.query(`SELECT * FROM ${name} WHERE id = ?`, [decoded.id]);
      if (rows.length > 0) {
        user = rows[0];
        break;
      }
    }

    if (!user) {
      return { message: "Użytkownik nie znaleziony", error: true, data: null };
    }

    const keysToExclude = ["password", "created_at", "updated_at"];
    const filteredUser = Object.fromEntries(
      Object.entries(user).filter(([key]) => !keysToExclude.includes(key))
    );

    return {
      message: "Token prawidłowy",
      error: false,
      data: {user: filteredUser}
    };
  } catch (err) {
    return { message: "Wystąpił błąd podczas logowania użytkownika", error: true, data: null };
  }
}