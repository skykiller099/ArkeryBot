const mysql = require("mysql2/promise");
const { dbConfig } = require("../config");

async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

module.exports = { getConnection };
