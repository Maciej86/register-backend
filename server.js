import express from "express";
import cros from "cors";
import dotenv from "dotenv";
import { userRoutes } from "./routes/users_api.js";
import { userSystem } from "./routes/user_system_api.js";
import { userLogin } from "./routes/user_login_api.js";

const exp = express();
exp.use(cros());
exp.use(express.json());
dotenv.config();

exp.use(userRoutes);

exp.use(userSystem);
exp.use(userLogin);

exp.use((err, req, res, next) => {
  res.status(500).send("Coś nie tak z serwerem");
});

const port = process.env.PORT;

exp.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});