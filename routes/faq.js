const express = require("express");

const { authenticated, isAdmin } = require("../middlewares/auth");

const {
  createFaqCategory,
  createFaqQuestion,
  readFaqCategories,
  readFaqQuestionById,
  readFaqCategoryById,
  readFaqQuestions,
  updateFaqCategory,
  updateFaqQuestion,
  removeFaqCategory,
  removeFaqQuestion
} = require("../controllers/faq");

const router = express.Router();

router
  .route("/categories")
  .post(authenticated, isAdmin, createFaqCategory)
  .get(readFaqCategories);
router
  .route("/questions")
  .post(authenticated, isAdmin, createFaqQuestion)
  .get(readFaqQuestions);
router
  .route("/categories/:id")
  .patch(authenticated, isAdmin, updateFaqCategory)
  .delete(authenticated, isAdmin, removeFaqCategory)
  .get(readFaqCategoryById);
router
  .route("/questions/:id")
  .patch(authenticated, isAdmin, updateFaqQuestion)
  .delete(authenticated, isAdmin, removeFaqQuestion)
  .get(readFaqQuestionById);
module.exports = router;
