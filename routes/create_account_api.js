import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { create_user_business, create_user_personal, verify_account } from "../query/create_user_query.js";
import { emailVerifyAccount } from "../email/VerifyAccount.js";

const router = express.Router();

router.post("/create_user_personal", async (req, res) => {
  const {first_name, last_name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const bytes = crypto.randomBytes(32);
  const verificationToken = bytes.toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 32);

  const query = await create_user_personal(first_name, last_name, email, hashedPassword, verificationToken);

  if(!query.error) {
    emailVerifyAccount(first_name, email, verificationToken, req.language);
  }
  res.send(query);
});

router.post("/create_user_business", async (req, res) => {
  const {first_name, last_name, email, password, company, tin, zip_code, city, address, bookkeeping} = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const bytes = crypto.randomBytes(32);
  const verificationToken = bytes.toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 32);

  const query = await create_user_business(first_name, last_name, email, hashedPassword, company, tin, zip_code, city, address, bookkeeping, verificationToken);

  if(!query.error) {
    emailVerifyAccount(first_name, email, verificationToken, req.language);
  }

  res.send(query);
});

router.get("/verify_account", async (req, res) => {
  const {token } = req.query;
  const query = await verify_account(token);

  res.send(query);

});

export const createUser = router;