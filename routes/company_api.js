import express from "express";
import { company_accountants } from "../query/company_query.js";
import { authenticateToken } from "../authorization/authenticateToken.js";
import { authorizeCompanyAccess } from "../authorization/authorizeCompanyAccess.js";

const router = express.Router();

router.get("/company_accountants", authenticateToken, authorizeCompanyAccess, async (req, res) => {
  const companyId = req.query.companyId;
  const query = await company_accountants(companyId) 

  res.send(query);
});

export const companyRoutes = router;