import express from "express";
import { add_company, companies, company_accountants } from "../query/company_query.js";
import { authenticateToken } from "../authorization/authenticateToken.js";

const router = express.Router();

router.get("/companies", authenticateToken, async (req, res) => {
  const selectedColumns = ["id", "name", "tax_identification_number", "zip_code", "city", "address", "total_employees", "manager_child_company", "accountants", "created_at"];
  const companyId = req.user.companyId;
  const query = await companies(companyId, selectedColumns) 

  res.send(query);
});

router.get("/company_accountants", authenticateToken, async (req, res) => {
  const companyId = req.user.companyId;
  const query = await company_accountants(companyId) 

  res.send(query);
});

router.post("/add_company", authenticateToken, async (req, res) => {
  const { first_name, last_name, email, phone, name_company, tin, zip_code, city, address, parent_company_id } = req.body;
  const query = await add_company(first_name, last_name, email, phone, name_company, tin, zip_code, city, address, parent_company_id);

  res.send(query);
});

export const companyRoutes = router;