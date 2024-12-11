import express from "express";
import bcrypt from "bcryptjs";
import { allusers } from "../query/users_query.js";

const router = express.Router();

router.get("/allusers", async (req, res) => {
  const usersRecord = await allusers();
  res.send(usersRecord);
});

export const userRoutes = router;