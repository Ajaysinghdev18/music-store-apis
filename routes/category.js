const express = require("express");
const { authenticated, isAdmin } = require("../middlewares/auth");

const {
  createCategory,
  getAllCategories,
  getCategoryById,
  deleteCategoryById,
  updateCategoryById
} = require("../controllers/category");

const router = express.Router();

router.post("/", authenticated, isAdmin, createCategory);
router.get("/", getAllCategories);
router
  .route("/:id")
  .get(getCategoryById)
  .delete(authenticated, isAdmin, deleteCategoryById)
  .patch(authenticated, isAdmin, updateCategoryById);

module.exports = router;
