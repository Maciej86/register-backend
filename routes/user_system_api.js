import express from "express";
import bcrypt from "bcryptjs";
import { register_system_user } from "../query/user_system_query.js";

const router = express.Router();

router.post("/register_dev", async (req, res) => {
  const { username, password } = req.body;
  console.log("req.body:",username, password);

  if (!username || !password) {
    return res.status(400).json({ error: "Podaj nazwę użytkownika i hasło." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const query = await register_system_user(username, hashedPassword)

  res.send(query);
});

export const userSystem = router;