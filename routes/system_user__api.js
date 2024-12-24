import express from "express";
import bcrypt from "bcryptjs";
import { register_system_user } from "../query/system_user_query.js";

const router = express.Router();

router.post("/register_dev", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Podaj nazwę użytkownika i hasło." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const query = await register_system_user(username, hashedPassword)

  res.send(query);
});

export const systemUser = router;