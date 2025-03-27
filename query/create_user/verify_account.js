import { pool } from "../../db.js";

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
        message: "server.login_app.invalid_verification_token",
        error: true,
        data: null
      };
    }

    if(user.is_verified) {
      return {
        message: "server.login_app.account_been_verified",
        error: false,
        data: null
      };
    }


    const verityUser = await pool.query(`UPDATE ${baseName} SET is_verified = ? WHERE id = ?`,[true, user.id]);

    return {
      message: "server.login_app.account_verified_success",
      error: false,
      data: verityUser
    };

  } catch (error) {
    return {
      message: "server.login_app.account_verified_error",
      error: true,
      data: error
    };
  }



}