import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import FormData from "form-data";
import Mailgun from 'mailgun.js';
import dotenv from "dotenv";
import { create_user_personal } from "../query/create_user_query.js";

dotenv.config();

const router = express.Router();

router.post("/create_user_personal", async (req, res) => {
  const {first_name, last_name, email, password } = req.body;
  console.log(first_name, last_name, email, password)
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: "Nie wszystkie pola zostały uzupełnione." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const bytes = crypto.randomBytes(32);
  const verificationToken = bytes.toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 32);

  const query = await create_user_personal(first_name, last_name, email, hashedPassword, verificationToken);

  res.send(query);


  // const mailgun = new Mailgun(FormData);
  // const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY});

  // mg.messages.create(process.env.MAILGUN_DOMAIN, {
  //   from: `Excited User <test@register.com>`,
  //   to: ["maciejregister@gmail.com"],
  //   subject: "Test",
  //   text: "Testowa wiadomość z MailGun",
  //   html: "<h1>Testowa wiadomość z MailGun</h1>"
  // })
  // .then(msg => res.send(msg)) // logs response data
  // .catch(err => res.send(err)); // logs any errorN

});

export const createUser = router;