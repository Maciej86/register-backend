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
  const [nameOrganization] = await pool.query(
    `SELECT users_organization.id_organization, organization.name_organization FROM users_organization LEFT JOIN organization ON users_organization.id_organization = organization.id WHERE users_organization.id_user = ?`,
    [id]
  );

  return nameOrganization;
};
