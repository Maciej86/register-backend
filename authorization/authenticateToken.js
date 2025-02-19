import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { clearAuthCookie } from "./clearAuthCookie.js";

dotenv.config();

export const authenticateToken = (req, res, next) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) {
      clearAuthCookie(res);
      return res.status(401).json({ error: true, message: "ERROR" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    clearAuthCookie(res);
    return res.status(403).json({ error: true, message: "ERROR" });
  }
};
