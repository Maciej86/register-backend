import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "../db.js";
import { clearAuthCookie } from "./clearAuthCookie.js";

dotenv.config();

export const authorizeCompanyAccess = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.companyId) {
      clearAuthCookie(res);
      return res.status(400).json({ message: "ERROR" });
    }

    const [rows] = await pool.query(
      `SELECT company_id FROM ${decoded.table} WHERE id = ?`,
      [decoded.id]
    );

    if (rows.length === 0 || rows[0].company_id !== decoded.companyId) {
      clearAuthCookie(res);
      return res.status(403).json({ message: "ERROR" });
    }

    next();
  } catch (error) {
    clearAuthCookie(res);
    res.status(500).json({ message: "Błąd serwera", error });
  }
};
