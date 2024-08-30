const Category = require("../models/Category");

const createCategoryDoc = category => {
  return Category.create(category);
};

const allCategories = (query = {}, projection = null, options = {}) => {
  return Category.find(query, projection, options);
};

const aggregateCategories = pipeline => {
  return Category.aggregate(pipeline);
};

const categoryById = id => {
  return Category.findOne({ _id: id });
};

const delCategoryById = id => {
  return Category.findByIdAndDelete({ _id: id });
};

const updCategoryById = (categoryId, categoryData) => {
  return Category.findByIdAndUpdate(categoryId, categoryData, {
    new: true
  });
};

module.exports = {
  createCategoryDoc,
  allCategories,
  aggregateCategories,
  categoryById,
  delCategoryById,
  updCategoryById
};
