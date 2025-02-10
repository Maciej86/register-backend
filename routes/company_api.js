import express from "express";
import { company_accountants } from "../query/company_query.js";
import { authenticateToken } from "../authenticateToken.js";

const router = express.Router();

router.get("/company_accountants", authenticateToken, async (req, res) => {
  const companyId = req.query.companyId;
  const query = await company_accountants(companyId) 

  res.send(query);
});

export const companyRoutes = router;