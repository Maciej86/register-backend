import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { emailPasswordReset } from "../email/PasswordReset.js"
import { add_token } from "../query/password_reset/add_token.js";
import { check_token } from "../query/password_reset/check_token.js";
import { save_new_password } from "../query/password_reset/save_new_password.js";

const router = express.Router();

router.post("/password_reset", async (req, res) => {
  const { email } = req.body;

  const bytes = crypto.randomBytes(32);
  const passwordResetToken = bytes.toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 32);
  const expiration =  new Date(Date.now() + 3600000);

  const query = await add_token(email, passwordResetToken, expiration);

  if(!query.error) {
    emailPasswordReset(query.data.userName, email, passwordResetToken, req.language);
  }

  res.send(query);
});

router.get("/password_reset_token", async (req, res) => {
  const {token} = req.query;
  const query = await check_token(token);

  res.send(query);

});

router.post("/password_reset_save", async (req, res) => {
  const {password, email, table} = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const query = await save_new_password(hashedPassword, email, table);

  res.send(query);

});

export const passwordReset = router;