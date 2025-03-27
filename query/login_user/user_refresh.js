import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "../../db.js";
import { clearAuthCookie } from "../../authorization/clearAuthCookie.js";

dotenv.config();

export const user_refresh = async (req) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return { message: "server.token_missing", error: true, data: null };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const [rows] = await pool.query(`SELECT * FROM ${decoded.table} WHERE id = ?`, [decoded.id]);
    const user = rows[0];

    if (!user) {
      clearAuthCookie(res);
      return { message: "server.user_not_found", error: true, data: null };
    }

    const keysToExclude = ["password", "created_at", "updated_at"];
    const filteredUser = Object.fromEntries(
      Object.entries(user).filter(([key]) => !keysToExclude.includes(key))
    );

    filteredUser.type = decoded.type;

    if (user.user_role !== "employee") {
      const [companyRows] = await pool.query(
        "SELECT * FROM companies WHERE id = ?", 
        [user.company_id]
      );
      if (companyRows.length > 0) {
        filteredUser.company = companyRows[0];
      }
    }

    // Additional information about the plan of the user who purchased access
    if (filteredUser.type === "user" && filteredUser.company.parent_company_id === null && user.user_role !== "employee") {
      const [planRows] = await pool.query(
        "SELECT * FROM plans WHERE name = ?", 
        [filteredUser.company.subscription_plan]
      );
      filteredUser.plan = planRows[0];

      const [createdCompanies] = await pool.query(
        "SELECT COUNT(*) AS company_count FROM companies WHERE parent_company_id = ?", 
        [user.company_id]
      );
  
      const [userCount] = await pool.query(
        `SELECT COUNT(*) AS users_count 
         FROM users 
         WHERE company_id IN (SELECT id FROM companies WHERE parent_company_id = ?)`, 
        [user.company_id]
      );
      
      filteredUser.plan.created_companies_count = createdCompanies[0]?.company_count || 0;
      filteredUser.plan.created_companies_users_count = userCount[0]?.users_count || 0;
    }

    return {
      message: "",
      error: false,
      data: {user: filteredUser}
    };
  } catch (err) {
    clearAuthCookie(res);
    return { message: "server.login_app.error_login_user", error: true, data: null };
  }
}