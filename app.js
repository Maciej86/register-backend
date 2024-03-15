import express from "express";
import cros from "cors";
import {
  addTokenUser,
  loginUser,
  loginUserToken,
  user,
  editAccount,
  passwordExsist,
  editUserPassword,
  emailExsist,
  allUsers,
  addUser,
  deleteUser,
} from "./users.js";
import {
  addOrganization,
  addUserOrganization,
  allOrganizations,
  deleteOrganization,
  editNameOrganization,
  nameOrganization,
  organization,
  userAddForOrganization,
  userDeleteInOrganization,
  usersInOrganization,
  userOrganization,
  usersOutOrganization,
  userDeleteAllOrganization,
} from "./organizatios.js";

const exp = express();
exp.use(cros());
exp.use(express.json());

// exp.get("/react/:id", async (req, res) => {
//   const id = req.params.id;
//   const react = await getTest(id);
//   res.send(react);
// });

// ------------------------------------------------- //
//                 LOGIN USER ACTION                //
// ------------------------------------------------//

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
  let userToken = await user(userId);
  res.send(userToken);
});

// User login using a token
exp.post("/logintoken", async (req, res) => {
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

// ------------------------------------------------- //
//                   USER ACTION                    //
// ------------------------------------------------//

// All users
exp.post("/allusers", async (req, res) => {
  const userSRecord = await allUsers();
  res.send(userSRecord);
});

// Fetch add new user
exp.post("/adduser", async (req, res) => {
  const { name, lastName, email, type, password, organizations } = req.body;
  const newUser = await addUser(name, lastName, email, password, type);

  if (newUser === false) {
    res.send(false);
    return;
  }
  if (organizations.length !== 0) {
    await userAddForOrganization(
      newUser.insertId,
      organizations,
      "idOrganizations"
    );
  }
  res.send(true);
});

// Delete user
exp.post("/deleteuser", async (req, res) => {
  const { idUser } = req.body;
  await deleteUser(idUser);
  res.send(true);
});

// Edit account user
exp.post("/editaccount", async (req, res) => {
  const { id, name, lastname, email, role, theme } = req.body;
  const statusEdit = await editAccount(id, name, lastname, email, role, theme);

  if (statusEdit) {
    let newDataUser = await user(id);
    res.send(newDataUser);
  }
});

exp.post("/fetchdatauser", async (req, res) => {
  const { id } = req.body;
  const data = await user(id);

  if (data.length === 0) {
    res.send([]);
    return;
  }
  const organization = await userOrganization(id);

  let idOrganization = [];
  organization.forEach((item) => {
    idOrganization = [...idOrganization, item.id_organization];
  });
  const dataUser = { dataUser: data[0], organizationId: idOrganization };

  res.send(dataUser);
});

// Password exsist
exp.post("/passwordexsist", async (req, res) => {
  const { id, oldpassword } = req.body;
  const oldPasswordExist = await passwordExsist(id, oldpassword);

  if (oldPasswordExist.length === 0) {
    res.send(true);
    return;
  }
  res.send(false);
});

exp.post("/editpassword", async (req, res) => {
  const { id, newpassword } = req.body;

  await editUserPassword(id, newpassword);
  res.send(true);
});

// Email exsist
exp.post("/emailexsist", async (req, res) => {
  const { email } = req.body;
  const checkEmail = await emailExsist(email);

  if (checkEmail.length === 0) {
    res.send(false);
    return;
  }
  res.send(true);
});

// ------------------------------------------------- //
//              ORGANIZATION ACTION                 //
// ------------------------------------------------//

// Fetch organization
exp.post("/organization", async (req, res) => {
  const { id } = req.body;
  const organizationRecord = await organization(id);

  res.send(organizationRecord);
});

// Fetch organization and count user
exp.post("/allorganization", async (req, res) => {
  const records = await allOrganizations();
  res.send(records);
});

// Fetch add new organization
exp.post("/addorganization", async (req, res) => {
  const { idUser, name, createdDate } = req.body;
  const nameOrganizationExsist = await nameOrganization(name);

  if (nameOrganizationExsist.length !== 0) {
    res.send([]);
    return;
  }

  const idOrganization = await addOrganization(name, idUser, createdDate);
  await addUserOrganization(idUser, idOrganization.insertId);
  const userRecord = await userOrganization(idUser);
  res.send(userRecord);
});

// Fetch edit name organization
exp.post("/editnameorganization", async (req, res) => {
  const { name, id } = req.body;
  const nameOrganizationExsist = await nameOrganization(name);

  if (nameOrganizationExsist.length !== 0) {
    res.send([]);
    return;
  }

  await editNameOrganization(name, id);
  const organizationEdit = await organization(id);

  res.send(organizationEdit);
});

exp.post("/deleteorganization", async (req, res) => {
  const { id } = req.body;
  const records = await deleteOrganization(id);
  res.send(records);
});

// ------------------------------------------------- //
//          USER IN ORGANIZATION ACTION             //
// ------------------------------------------------//

// Fetch organization user
exp.post("/userorganization", async (req, res) => {
  const { id } = req.body;
  const userRecord = await userOrganization(id);

  res.send(userRecord);
});

// Fetch user in organization
exp.post("/usersinorganization", async (req, res) => {
  const { id } = req.body;
  const records = await usersInOrganization(id);
  res.send(records);
});

// Fetch user out organization
exp.post("/usersoutorganization", async (req, res) => {
  const { id } = req.body;
  const records = await usersOutOrganization(id);
  res.send(records);
});

// Fetch delete user in organization
exp.post("/deleteuserinorganization", async (req, res) => {
  const { idUsers, idOrganization } = req.body;
  await userDeleteInOrganization(idUsers);
  const userInOrganization = await usersInOrganization(idOrganization);
  res.send(userInOrganization);
});

// Fetch add user for organization
exp.post("/adduserorganization", async (req, res) => {
  const { idUsers, idOrganization } = req.body;
  await userAddForOrganization(idUsers, idOrganization, "idUsers");
  const records = await usersOutOrganization(idOrganization);
  res.send(records);
});

exp.post("/edituserallorganization", async (req, res) => {
  const { idUser, idOrganization } = req.body;
  await userDeleteAllOrganization(idUser);

  if (idOrganization.length > 0) {
    await userAddForOrganization(idUser, idOrganization, "idOrganizations");
  }
  res.send(true);
});

exp.use((err, req, res, next) => {
  res.status(500).send("Coś nie tak z serwerem");
});

const port = process.env.PORT;

exp.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});
