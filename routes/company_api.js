import express from "express";
import { authenticateToken } from "../authorization/authenticateToken.js";
import { companies } from "../query/company/companies.js";
import { company_accountants } from "../query/company/company_accountants.js";
import { add_company } from "../query/company/add_company.js";
import { delete_company } from "../query/company/delete_company.js";

const router = express.Router();

router.get("/companies", authenticateToken, async (req, res) => {
  const selectedColumns = ["id", "name_company", "tax_identification_number", "zip_code", "city", "address", "total_employees", "parent_administrator_child_company", "phone", "email", "accountants", "created_at"];
  const companyId = req.user.companyId;
  const query = await companies(companyId, selectedColumns) 

  res.send(query);
});

router.get("/company_accountants", authenticateToken, async (req, res) => {
  const companyId = req.user.companyId;
  const query = await company_accountants(companyId) 

  res.send(query);
});

router.get("/get_company/:id", authenticateToken, async (req, res) => {
  const { id } = req.query;
  const companyId = req.user.companyId;
  const userRole = req.user.role;

  res.send(id, companyId, userRole);
});

router.post("/add_company", authenticateToken, async (req, res) => {
  const { first_name, last_name, email, phone, name_company, tin, zip_code, city, address } = req.body;
  const userCompanyId = req.user.companyId;
  const userRole = req.user.role;
  const query = await add_company(first_name, last_name, email, phone, name_company, tin, zip_code, city, address, userCompanyId, userRole);

  res.send(query);
});

router.delete("/delete_company/:id", authenticateToken, async (req, res) => {
  const companyId = Number(req.params.id);
  const userCompanyId = req.user.companyId;
  const userRole = req.user.role;
  const query = await delete_company(companyId, userCompanyId, userRole);

  res.send(query);
});

export const companyRoutes = router;