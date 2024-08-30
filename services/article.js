const Article = require("../models/Article");

const createArticle = object => {
  return Article.create(object);
};

const readArticleById = id => {
  return Article.findOne({ _id: id });
};

const readAllArticle = (query = {}, projection = null, options = {}) => {
  return Article.find(query, projection, options);
};

const deleteArticleById = id => {
  return Article.findByIdAndDelete({ _id: id });
};

const updateArticleById = (id, data) => {
  return Article.findByIdAndUpdate(id, data, {
    new: true
  });
};

module.exports = {
  createArticle,
  readArticleById,
  readAllArticle,
  deleteArticleById,
  updateArticleById
};
