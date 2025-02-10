import express from "express";
import { company_accountants } from "../query/company_query.js";

const router = express.Router();

router.get("/company_accountants", async (req, res) => {
  const companyId = req.query.companyId;
  const query = await company_accountants(companyId) 

  res.send(query);
});

export const companyRoutes = router;