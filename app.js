import express from "express";
import cros from "cors";
import {
  addTokenUser,
  loginUser,
  loginUserToken,
  user,
  editAccount,
  passwordExists,
  editUserPassword,
} from "./users.js";

const exp = express();
exp.use(cros());
exp.use(express.json());

// exp.get("/react/:id", async (req, res) => {
//   const id = req.params.id;
//   const react = await getTest(id);
//   res.send(react);
// });

// User login using the form
exp.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userLogin = await loginUser(email, password);

  if (userLogin.length === 0) {
    res.send([]);
    return;
  }

  const userId = userLogin[0].id;
  await addTokenUser(userId);
  const userToken = await user(userId);
  res.send(userToken);
});

// User login using a token
exp.post("/login-token", async (req, res) => {
  const { token } = req.body;
  const userLoginToken = await loginUserToken(token);

  if (userLoginToken.length === 0) {
    res.send([]);
    return;
  }

  res.send(userLoginToken);
});

// Login out user
exp.post("/loginout", async (req, res) => {
  const { id } = req.body;
  await addTokenUser(id);

  const userToken = await user(id);
  res.send(userToken);
});

// Edit account user
exp.post("/editaccount", async (req, res) => {
  const { id, name, lastname, email, theme } = req.body;
  const statusEdit = await editAccount(id, name, lastname, email, theme);

  if (statusEdit) {
    const newDataUser = await user(id);
    res.send(newDataUser);
  }
});

exp.post("/editpassword", async (req, res) => {
  const { id, oldpassword, newpassword } = req.body;
  const oldPasswordExist = await passwordExists(id, oldpassword);

  if (oldPasswordExist.length === 0) {
    res.send("error");
    return;
  }

  await editUserPassword(id, newpassword);
  res.send("ok");
});

exp.use((err, req, res, next) => {
  res.status(500).send("Coś nie tak z serwerem");
});

const port = process.env.PORT || 8080;

exp.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});
