const Privacy = require("../models/Privacy");

const createPrivacy = object => {
  return Privacy.create(object);
};

const readPrivacy = (query = {}, projection = null, options = {}) => {
  return Privacy.findOne({}, projection, options);
};

const updatePrivacy = async (productData) => {
  await Privacy.findOneAndUpdate({}, productData, {
    upsert: true
  });

  return Privacy.findOne({});
};


module.exports = {
  createPrivacy,
  readPrivacy,
  updatePrivacy
};
