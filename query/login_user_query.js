import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

export const login_user = async (login, password) => {
  const tables = [
    { name: "users", type: "user" },
    { name: "personal_accounts", type: "personal" },
    { name: "system_users", type: "system" }
  ];
  let user = null;
  let tablename = null;
  let userType = null;

  try{
    for (const { name, type } of tables) {
      const [rows] = await pool.query(`SELECT * FROM ${name} WHERE email = ?`, [login]);
      if (rows.length > 0) {
        user = rows[0];
        tablename = name;
        userType = type;
        break;
      }
    }

    if (!user) {
      return {
        message: "server.invalid_login",
        error: true,
        data: null
      };
    }
    
    if (!user.is_verified) {
      return {
        message: "server.account_not_verified",
        error: true,
        data: null
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        message: "server.invalid_login",
        error: true,
        data: null
      };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, table: tablename, type: userType },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const keysToExclude = ["password", "created_at", "updated_at"];
    const filteredUser = Object.fromEntries(
      Object.entries(user).filter(([key]) => !keysToExclude.includes(key))
    );

    filteredUser.type = userType;
    
    const dataSend = {
      token: token,
      user: filteredUser
    }

    return {
      message: "",
      error: false,
      data: dataSend
    };
  } catch (error) {
    return {
      message: "server.error_login_user",
      error: true,
      data: null
    };
  }
};

export const user_refresh = async (header) => {
  const token = header.headers.authorization?.split(" ")[1];
  if (!token) {
    return { message: "server.token_missing", error: true, data: null };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const [rows] = await pool.query(`SELECT * FROM ${decoded.table} WHERE id = ?`, [decoded.id]);
    const user = rows[0];

    if (!user) {
      return { message: "server.user_not_found", error: true, data: null };
    }

    const keysToExclude = ["password", "created_at", "updated_at"];
    const filteredUser = Object.fromEntries(
      Object.entries(user).filter(([key]) => !keysToExclude.includes(key))
    );

    filteredUser.type = decoded.type;

    return {
      message: "",
      error: false,
      data: {user: filteredUser}
    };
  } catch (err) {
    return { message: "server.error_login_user", error: true, data: null };
  }
}