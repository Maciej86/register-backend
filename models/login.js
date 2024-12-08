import express from "express";
import { allusers } from "../routes/user.js";

const router = express.Router();

router.get("/allusers", async (req, res) => {
  const usersRecord = await allusers();
  res.send(usersRecord);
});

export const userRoutes = router;