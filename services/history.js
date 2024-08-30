const History = require("../models/History");

const readAll = (query = {}, projection = null, options = {}) => {
  return History.find(query, projection, options).populate("user");
};
const deleteAll = (query = {}, projection = null, options = {}) => {
  return History.deleteMany();
};

const createHistory = object => {
  return History.create(object);
};

module.exports = {
  readAll,
  createHistory,
};
