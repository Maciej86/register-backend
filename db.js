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

export async function getTests() {
  const [rows] = await pool.query("SELECT * FROM react_test");
  return rows;
}

export async function getTest(id) {
  const [rows] = await pool.query(`SELECT * FROM react_test WHERE id = ?`, [
    id,
  ]);
  return rows[0];
}
