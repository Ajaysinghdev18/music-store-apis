const { validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const { makeHistoryContent } = require('../utils/helpers');

const {
  createCategoryDoc,
  allCategories,
  updCategoryById,
  delCategoryById,
  categoryById,
  aggregateCategories
} = require("../services/category");
const { allProducts } = require("../services/product");
const { createHistory } = require("../services/history");

const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, errors: errors.array() });
    }

    await createCategoryDoc(req.body);

    const content = makeHistoryContent(
        req.user.name,
        '',
        'created',
        `a category`
        ,` "${req.body.name}".`)
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);

    res
      .status(StatusCodes.CREATED)
      .json({ success: true, msg: "Category created!" });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .join({ success: false, error: err.message });
  }
};

const getAllCategories = async (req, res) => {
  try {
    let { query, projection, options, aggregate } = req.query;

    if (aggregate) {
      aggregate = JSON.parse(aggregate);

      let categories = await aggregateCategories(aggregate);
      res.status(StatusCodes.OK).json({ success: true, categories });
    } else {
      let newQuery = {};

      if (query) {
        query = JSON.parse(query);
        Object.entries(query).map(([key, value]) => {
          if (typeof value === "string") {
            newQuery[key] = new RegExp(`${value}`, "i");
          } else {
            newQuery[key] = value;
          }
        });
      }

      if (projection) {
        projection = JSON.parse(projection);
      }
      if (options) {
        options = JSON.parse(options);
      }

      let categories = await allCategories(newQuery, projection, options);
      for (let i = 0; i < categories.length; i++) {
        categories[i].products = await allProducts({
          category: categories[i].id
        });
      }

      const all = await allCategories(newQuery);

      let pageLimit;
      let pageNumber;
      if (options) {
        if (options.limit) {
          pageLimit = options.limit;

          if (options.skip) {
            pageNumber = options.skip / options.limit;
          }
        }
      }

      const pagination = {
        total: all.length,
        pageLimit,
        pageNumber
      };

      res
        .status(StatusCodes.OK)
        .json({ success: true, categories, pagination });
    }
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await categoryById(id);

    if (!category) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, msg: "Not Found" });
    }

    category.products = await allProducts({ category: category._id });

    res.status(StatusCodes.OK).json({ success: true, category });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const deleteCategoryById = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await categoryById(id);
    await delCategoryById(id);

    const content = makeHistoryContent(
        req.user.name,
        '',
        'deleted',
        `a category`
        ,` "${category.name}".`)
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);

    res.status(StatusCodes.OK).json({ success: true });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const updateCategoryById = async (req, res) => {
  try {
    const id = req.params.id;

    await updCategoryById(id, req.body);

    const category = await categoryById(id);

    const content = makeHistoryContent(
        req.user.name,
        '',
        'updated',
        `a category`
        ,` "${category.name}".`)
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);

    res.status(StatusCodes.OK).json({ success: true });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  deleteCategoryById,
  updateCategoryById
};
