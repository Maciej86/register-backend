import express from "express";
import cros from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { languageMiddleware } from './i18nConfig.js';
import { systemUser } from "./routes/system_user__api.js";
import { loginUser } from "./routes/login_user_api.js";
import { createUser } from "./routes/create_account_api.js";
import { passwordReset } from "./routes/password_reset_api.js";
import { companyRoutes } from "./routes/company_api.js";

const exp = express();
exp.use(cros({
  origin: process.env.DOMAIN,
  credentials: true
}));
exp.use(cookieParser());
exp.use(express.json());
exp.use(languageMiddleware);

dotenv.config();

exp.use(systemUser);
exp.use(loginUser);
exp.use(createUser);
exp.use(passwordReset);

exp.use(companyRoutes);

exp.use((err, req, res, next) => {
  res.status(500).send("Coś nie tak z serwerem");
});

const port = process.env.PORT;

exp.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});