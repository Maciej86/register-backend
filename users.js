import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

const generateToken = () => {
  const char = [
    ..."#!@1234567890aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPrRsStTuUwWxXyYzZ",
  ];
  let token = "";
  for (let i = 0; i < 100; i++) {
    token = token + char[Math.floor(Math.random() * 27)];
  }
  return token;
};

export const user = async (id) => {
  const [user] = await pool.query(
    `SELECT id, name, last_name, email, token_login, role, theme FROM user WHERE id = ?`,
    [id]
  );
  return user;
};

export const loginUser = async (email, password) => {
  const [user] = await pool.query(
    `SELECT * FROM user WHERE email = ? AND password = ?`,
    [email, password]
  );
  return user;
};

export const loginUserToken = async (token) => {
  const [user] = await pool.query(
    `SELECT id, name, last_name, email, token_login, role, theme FROM user WHERE token_login = ?`,
    [token]
  );
  return user;
};

export const addTokenUser = async (id) => {
  const token = generateToken();
  await pool.query(`UPDATE user SET token_login = ? WHERE id = ?`, [token, id]);
  return;
};

export const editAccount = async (id, name, lastname, email, theme) => {
  await pool.query(
    `UPDATE user SET name = ?, last_name = ?, email = ?, theme = ? WHERE id = ?`,
    [name, lastname, email, theme, id]
  );

  return true;
};

export const emailExsist = async (email) => {
  const [emailExsist] = await pool.query(
    `SELECT email FROM user WHERE email = ?`,
    [email]
  );

  return emailExsist;
};

export const passwordExists = async (id, passworduser) => {
  const [password] = await pool.query(
    `SELECT password FROM user WHERE id = ? AND password = ?`,
    [id, passworduser]
  );
  return password;
};

export const editUserPassword = async (id, newpassword) => {
  await pool.query(`UPDATE user SET password = ? WHERE id = ?`, [
    newpassword,
    id,
  ]);
  return;
};

export const allUsers = async () => {
  const [password] = await pool.query(
    `SELECT u.id, u.name, u.last_name, u.email, u.role, o.id as organization_id, o.name_organization as organization_name FROM user u LEFT JOIN users_organization uo ON u.id = uo.id_user LEFT JOIN organization o ON uo.id_organization = o.id WHERE u.role > 0 AND u.status = "active" AND (uo.id_organization IS NULL OR o.id IS NOT NULL) ORDER BY u.role;`
  );
  return password;
};

export const addUser = async (name, lastName, email, password, type) => {
  const [newRow] = await pool.query(
    `INSERT INTO user (name, last_name, email, password, token_login, role, theme, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, lastName, email, password, "", type, "ThemeDefault", "active"]
  );
  return newRow;
};

export const deleteUser = async (idUser) => {
  const [deleteRecords] = await pool.query(
    `UPDATE user SET email = ?, password = ?, token_login = ?, status = ? WHERE id = ?`,
    [null, null, null, "deactive", idUser]
  );

  return deleteRecords;
};
