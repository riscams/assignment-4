const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('postgres://postgres:Erajaya2022@192.168.3.250:5432/training-nodejs')

module.exports = sequelize