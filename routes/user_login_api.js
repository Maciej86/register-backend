import express from "express";
import { login_user } from "../query/user_login_query.js";

const router = express.Router();

router.post("/user_login", async (req, res) => {
  const { login, password } = req.body;
  const query = await login_user(login, password);

  res.send(query);
});

export const userLogin = router;