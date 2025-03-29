export const checkUserRole = async (userRole, allowedRoles, connection = null) => {
  if (!allowedRoles.includes(userRole)) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    return {
      message: "server.no_permissions",
      error: true,
      data: null
    };
  }
  return null;
};