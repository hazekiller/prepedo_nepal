// models/adminModel.js
const { sequelize } = require("../config/database");

const Admin = {
  findByEmail: async (email) => {
    try {
      const results = await sequelize.query(
        "SELECT * FROM admins WHERE email = ? LIMIT 1",
        {
          replacements: [email],
          type: sequelize.QueryTypes.SELECT
        }
      );
      return results[0] || null;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = Admin;