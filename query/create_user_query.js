import { pool } from "../db.js";

export const create_user_personal = async (first_name, last_name, email, hashedPassword, verificationToken) => {
  try{
    const result = await pool.query(
      "INSERT INTO personal_accounts (first_name, last_name, email, password, created_at, updated_at, is_verified, verification_token) VALUES (?, ?, ?, ?, NOW(), NOW(), false, ?)",
      [first_name, last_name, email, hashedPassword, verificationToken]);

    return {
      message: "Użytkownik dodany pomyślnie",
      error: false,
      data: result
    };
  } catch (error) {
    console.error("Błąd zapisu do bazy:", error);
    return {
      message: "Wystąpił błąd podczas dodawania użytkownika",
      error: true,
      data: null
    };
  }
};