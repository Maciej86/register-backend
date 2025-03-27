import express from "express";
import { authenticateToken } from "../authorization/authenticateToken.js";
import { companies } from "../query/company/companies.js";
import { company_accountants } from "../query/company/company_accountants.js";
import { add_company } from "../query/company/add_company.js";

const router = express.Router();

router.get("/companies", authenticateToken, async (req, res) => {
  const selectedColumns = ["id", "name_company", "tax_identification_number", "zip_code", "city", "address", "total_employees", "manager_child_company", "phone", "email", "accountants", "created_at"];
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

router.delete("/delete_company/:id", authenticateToken, async (req, res) => {
  const companyId = req.params.id;
  console.log(companyId);

  res.send(companyId);
});

export const companyRoutes = router;