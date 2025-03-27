import { pool } from "../../db.js";

export const create_user_business = async (first_name, last_name, email, hashedPassword, company, tin, zip_code, city, address, bookkeeping, verificationToken) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [resultCompany] = await connection.query(
      `INSERT INTO companies (name, tax_identification_number, zip_code, city, address, parent_company_id, subscription_plan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NULL, "Basic", NOW(), NOW())`,
      [company, tin, zip_code, city, address]);

    const idCompany = resultCompany.insertId;

    const resultUser = await connection.query(
      `INSERT INTO users (company_id, first_name, last_name, email, password, theme, phone_number, address_street, address_city, address_postal_code, user_role, bookkeeping, employment_date, user_status, contract_type, vacation_days, medical_exam_date, hourly_rate, monthly_rate, is_verified, verification_token, created_at, updated_at) VALUES (?, ?, ?, ?, ?, "defaultTheme", NULL, NULL, NULL, NULL, "main_administrator", ?, NULL, true, NULL, NULL, NULL, NULL, NULL, false, ? , NOW(), NOW())`,
      [idCompany, first_name, last_name, email, hashedPassword, bookkeeping, verificationToken]);

    await connection.commit();
    connection.release();

    return {
      message: "server.login_app.create_account_ok",
      error: false,
      data: resultUser
    };

  } catch (error) {
    await connection.rollback();
    connection.release();

    return {
      message: "server.login_app.create_account_error",
      error: true,
      data: error
    };
  }
};