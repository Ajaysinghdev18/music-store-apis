const Us = require("../models/Us");

const createUs = object => {
  return Us.create(object);
};

const readUs = (query = {}, projection = null, options = {}) => {
  return Us.find(query, projection, options);
};

const readUsById = id => {
  return Us.findOne({ _id: id });
};

const deleteUsById = id => {
  return Us.findByIdAndDelete({ _id: id });
};


const updateUsById = (productId, productData) => {
  return Us.findByIdAndUpdate(productId, productData, {
    new: true
  });
};

module.exports = {
  createUs,
  readUs,
  readUsById,
  deleteUsById,
  updateUsById
};
