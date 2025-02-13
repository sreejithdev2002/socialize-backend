const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("socialize", "root", "Sree@2002", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;
