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
