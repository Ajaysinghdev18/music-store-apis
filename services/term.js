const Term = require("../models/Term");

const createTerm = object => {
  return Term.create(object);
};

const readTerm = (query = {}, projection = null, options = {}) => {
  return Term.findOne({}, projection, options);
};

const updateTerm = async (productData) => {
  await Term.findOneAndUpdate({}, productData, {
    upsert: true
  });

  return Term.findOne({});
};


module.exports = {
  createTerm,
  readTerm,
  updateTerm
};
