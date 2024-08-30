const FaqCategory = require("../models/FaqCategory");
const FaqQuestion = require("../models/FaqQuestion");

const createCategory = object => {
  return FaqCategory.create(object);
};

const readCategory = id => {
  return FaqCategory.findOne({ _id: id });
};

const readCategories = (query = {}, projection = null, options = {}) => {
  return FaqCategory.find(query, projection, options);
};

const deleteCategoryById = id => {
  return FaqCategory.findByIdAndDelete({ _id: id });
};

const updateCategoryById = (categoryId, category) => {
  return FaqCategory.findByIdAndUpdate(categoryId, category, {
    new: true
  });
};

const createQuestion = object => {
  return FaqQuestion.create(object);
};

const readQuestion = id => {
  return FaqQuestion.findOne({ _id: id }) ;
};

const readQuestions = (query = {}, projection = null, options = {}) => {
  return FaqQuestion.find(query, projection, options).populate('category').exec();
};

const deleteQuestionById = id => {
  return FaqQuestion.findByIdAndDelete({ _id: id });
};

const updateQuestionById = (questionId, question) => {
  return FaqQuestion.findByIdAndUpdate(questionId, question, {
    new: true
  });
};

module.exports = {
  createCategory,
  readCategory,
  readCategories,
  deleteCategoryById,
  updateCategoryById,
  createQuestion,
  readQuestion,
  readQuestions,
  deleteQuestionById,
  updateQuestionById
};
