const bcrypt = require("bcrypt");
const User = require("../models/User");

const generatePasswordHash = (password, salt) => {
  return bcrypt.hash(password, salt);
};

const matchPasswordHash = (userPass, dbPass) => {
  return bcrypt.compare(userPass, dbPass);
};

module.exports = {
  generatePasswordHash,
  matchPasswordHash
};
