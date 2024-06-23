
const { DataTypes } = require('sequelize');
const sequelize = require("./index.js")

  const Ubuntu = sequelize.define("ubuntu", {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    NOM: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    IP_ADRESSE: {
      type: DataTypes.STRING,
      allowNull: false,
    },   

    description: {
      type: DataTypes.TEXT,
    },
   

  },{
    freezeTableName: true,
    tableName: 'ubuntu',
    timestamps: false
  });

  module.exports = Ubuntu