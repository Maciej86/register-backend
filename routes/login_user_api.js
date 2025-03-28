import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "../db.js";
import { user_refresh } from "../query/login_user/user_refresh.js";
import { login_user } from "../query/login_user/login_user.js";

dotenv.config();
const router = express.Router();

router.post("/user_login", async (req, res) => {
  const query = await login_user(req, res);

  res.send(query);
});

router.get("/user_refresh", async (req, res) => {
  const query = await user_refresh(req);

  res.send(query);
});

router.get("/check-auth", async (req, res) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) {
      return res.json({ isAuthenticated: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await pool.query(`SELECT id FROM ${decoded.table} WHERE id = ?`, [decoded.id]);

    if (rows.length === 0) {
      return res.json({ isAuthenticated: false });
    }

    return res.json({ isAuthenticated: true });
  } catch (error) {
    console.log(error);
    return res.json({ isAuthenticated: false });
  }
});

export const loginUser = router;