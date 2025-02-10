import { pool } from "../db.js";


export const authorizeCompanyAccess = async (req, res, next) => {
  try {
    const companyId = parseInt(req.query.companyId);
    const userId = req.user.id;

    if (!companyId) {
      return res.status(400).json({ message: "ERROR" });
    }

    const [rows] = await pool.query(
      "SELECT company_id FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0 || rows[0].company_id !== companyId) {
      return res.status(403).json({ message: "ERROR" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera", error });
  }
};
