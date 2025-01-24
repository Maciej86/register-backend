import { pool } from "../db.js";

export const create_user_personal = async (first_name, last_name, email, hashedPassword, verificationToken) => {
  try{
    const [rows] = await pool.query(
      "SELECT email FROM personal_accounts WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      return {
        message: "server.email_already_exists",
        error: true,
        data: null
      };
    }

    const result = await pool.query(
      `INSERT INTO personal_accounts (first_name, last_name, email, password, theme, created_at, verification_token, updated_at, is_verified) VALUES (?, ?, ?, ?, "defaultTheme", false, ?, NOW(), NOW())`,
      [first_name, last_name, email, hashedPassword, verificationToken]);

    return {
      message: "server.create_account_ok",
      error: false,
      data: result
    };
  } catch (error) {
    return {
      message: "server.create_account_error",
      error: true,
      data: error
    };
  }
};

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

    return {
      message: "server.create_account_ok",
      error: false,
      data: resultUser
    };

  } catch (error) {
    return {
      message: "server.create_account_error",
      error: true,
      data: error
    };
  }

};

export const verify_account = async (token) => {
  const tables = [
    { name: "users"},
    { name: "personal_accounts"},
    { name: "system_users"}
  ];
  let user = null;
  let baseName = null

  try {
    for (const { name } of tables) {
      const [isToken] = await pool.query(
        `SELECT id, is_verified, verification_token FROM ${name} WHERE verification_token = ?`,[token]
      );
      if (isToken.length > 0) {
        user = isToken[0];
        baseName = name;
        break;
      }
    }

    if(!user) {
      return {
        message: "server.invalid_verification_token",
        error: true,
        data: null
      };
    }

    if(user.is_verified) {
      return {
        message: "server.account_been_verified",
        error: false,
        data: null
      };
    }


    const verityUser = await pool.query(`UPDATE ${baseName} SET is_verified = ? WHERE id = ?`,[true, user.id]);

    return {
      message: "server.account_verified_success",
      error: false,
      data: verityUser
    };

  } catch (error) {
    return {
      message: "server.account_verified_error",
      error: true,
      data: error
    };
  }



}