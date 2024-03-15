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

export const nameOrganization = async (name) => {
  const [organization] = await pool.query(
    `SELECT * FROM organization WHERE name_organization = ?`,
    [name]
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

export const addOrganization = async (name, idUser, createdDate) => {
  const [newRow] = await pool.query(
    `INSERT INTO organization (name_organization, id_user, created_date) VALUES (?, ?, ?)`,
    [name, idUser, createdDate]
  );

  return newRow;
};

export const editNameOrganization = async (name, id) => {
  await pool.query(
    `UPDATE organization SET name_organization = ? WHERE id = ?`,
    [name, id]
  );

  return true;
};

export const addUserOrganization = async (idUser, idOrganization) => {
  await pool.query(
    `INSERT INTO users_organization (id_user, id_organization) VALUES (?,?)`,
    [idUser, idOrganization]
  );
  return;
};

export const allOrganizations = async () => {
  const [allRecords] = await pool.query(
    `SELECT organization.id, organization.name_organization, DATE_FORMAT(organization.created_date, '%d.%m.%Y') AS add_date, COUNT(users_organization.id_user) AS count_user, user.name, user.last_name FROM organization LEFT JOIN users_organization ON organization.id = users_organization.id_organization LEFT JOIN user ON organization.id_user = user.id WHERE user.status = "active" GROUP BY organization.name_organization`
  );

  return allRecords;
};

export const usersInOrganization = async (id) => {
  const [allRecords] = await pool.query(
    `SELECT user.name, user.last_name, user.role, users_organization.id FROM user JOIN users_organization ON user.id = users_organization.id_user WHERE users_organization.id_organization = ? AND user.role > 0 AND user.status = "active" ORDER BY user.role;`,
    [id]
  );

  return allRecords;
};

export const usersOutOrganization = async (id) => {
  const [allRecords] = await pool.query(
    `SELECT id, name, last_name, role FROM user WHERE NOT EXISTS (SELECT ? FROM users_organization WHERE users_organization.id_user = user.id AND users_organization.id_organization = ?) AND user.role > 0 AND user.status = "active" ORDER BY user.role;`,
    [id, id]
  );

  return allRecords;
};

export const userDeleteInOrganization = async (idUser) => {
  const [deleteRecords] = await pool.query(
    `DELETE FROM users_organization WHERE id IN (?)`,
    [idUser]
  );

  return deleteRecords;
};

export const userDeleteAllOrganization = async (idUser) => {
  const [deleteRecords] = await pool.query(
    `DELETE FROM users_organization WHERE id_user = ?`,
    [idUser]
  );

  return deleteRecords;
};

export const userAddForOrganization = async (
  idUsers,
  idOrganization,
  typeId
) => {
  let values = [];

  switch (typeId) {
    case "idUsers":
      values = idUsers.map((idsUser) => [idsUser, idOrganization]);
      break;
    case "idOrganizations":
      values = idOrganization.map((organization) => [idUsers, organization]);
      break;
  }

  const [addRecords] = await pool.query(
    `INSERT INTO users_organization (id_user, id_organization) VALUES ?`,
    [values]
  );

  return addRecords;
};

export const deleteOrganization = async (id) => {
  const [deleteRecords] = await pool.query(
    `DELETE FROM organization WHERE id IN (?)`,
    [id]
  );

  return deleteRecords;
};
