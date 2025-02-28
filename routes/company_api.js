import express from "express";
import { add_company, company_accountants } from "../query/company_query.js";
import { authenticateToken } from "../authorization/authenticateToken.js";
import { authorizeCompanyAccess } from "../authorization/authorizeCompanyAccess.js";

const router = express.Router();

router.get("/company_accountants", authenticateToken, authorizeCompanyAccess, async (req, res) => {
  const companyId = req.query.companyId;
  const query = await company_accountants(companyId) 

  res.send(query);
});

router.post("/add_company", authenticateToken, async (req, res) => {
  const { first_name, last_name, email, phone, name_company, tin, zip_code, city, address, parent_company_id } = req.body;
  const query = await add_company(first_name, last_name, email, phone, name_company, tin, zip_code, city, address, parent_company_id);

  res.send(query);
});

export const companyRoutes = router;