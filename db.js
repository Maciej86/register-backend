import express from "express";
import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

export const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

  const allusers = async () => {
    const [users] = await pool.query(
      `SELECT * FROM users`
    );

    return {
      message: "Użytkownicy",
      error: false,
      data: users
    };
  };

  router.get("/allusers", async (req, res) => {
    const usersRecord = await allusers();
    res.send(usersRecord);
  });

  export const userRoutes = router;