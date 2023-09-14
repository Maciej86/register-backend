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

export const organization = async (id) => {
  const [organization] = await pool.query(
    `SELECT * FROM organization WHERE id = ?`,
    [id]
  );

  return organization;
};

export const userOrganization = async (id) => {
  const [nameOrganization] = await pool.query(
    `SELECT users_organization.id_organization, organization.name_organization FROM users_organization LEFT JOIN organization ON users_organization.id_organization = organization.id WHERE users_organization.id_user = ?`,
    [id]
  );

  return nameOrganization;
};

export const addOrganization = async (name) => {
  const [newRow] = await pool.query(
    `INSERT INTO organization (name_organization) VALUES (?)`,
    [name]
  );

  return newRow;
};

export const addUserOrganization = async (idUser, idOrganization) => {
  await pool.query(
    `INSERT INTO users_organization (id_user, id_organization) VALUES (?,?)`,
    [idUser, idOrganization]
  );
  return;
};
