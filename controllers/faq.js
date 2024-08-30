const { StatusCodes } = require("http-status-codes");
const { validationResult } = require("express-validator");

const {
  createCategory,
  readCategory,
  readCategories,
  deleteCategoryById,
  updateCategoryById,
  createQuestion,
  readQuestions,
  readQuestion,
  deleteQuestionById,
  updateQuestionById
} = require("../services/faq");
const { createHistory } = require("../services/history");
const {makeHistoryContent} = require("../utils/helpers");

const createFaqCategory = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, errors: errors.array() });
    }

    await createCategory(req.body);

    const content = makeHistoryContent(
        req.user.name,
        '',
        'created',
        `a category`
        ,` "${req.body.title}".`)
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);

    res.status(StatusCodes.OK).send({ success: "success" });
  } catch (err) {
    console.log(
      "🚀 ~ file: controllers / faq.js ~ line 85 ~ update ~ err",
      err
    );
    res.status(500).json({ success: false, error: err.message });
  }
};

const createFaqQuestion = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, errors: errors.array() });
    }

    const question = await createQuestion(req.body);
    const category = await readCategory(req.body.category);
    await updateCategoryById(category._doc._id, {
      ...category._doc,
      questions: [...category._doc.questions, question._doc._id]
    });

    const content = makeHistoryContent(
        req.user.name,
        '',
        'created',
        `a question`
        ,` "${req.body.title}".`)
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);


    res.status(StatusCodes.OK).send({ success: "success" });
  } catch (err) {
    console.log(
      "🚀 ~ file: controllers / faq.js ~ line 85 ~ update ~ err",
      err
    );
    res.status(500).json({ success: false, error: err.message });
  }
};

const readFaqCategories = async (req, res) => {
  try {
    const faqCategories = await readCategories().populate("questions");

    res.status(200).json({ success: true, faqCategories });
  } catch (err) {
    console.log("🚀 ~ file: faq.js ~ line 255 ~ read us ~ error", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const readFaqQuestions = async (req, res) => {
  try {
    const faqQuestions = await readQuestions();

    res.status(200).json({ success: true, faqQuestions });
  } catch (err) {
    console.log("🚀 ~ file: faq.js ~ line 255 ~ read us ~ error", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const readFaqQuestionById = async (req, res) => {
  try {
    const id = req.params.id;
    const faqQuestion = await readQuestion(id);

    // if(!faqQuestion.populated('category')) {
    //   await faqQuestion.populate('category').exec();
    // }

    res.status(200).json({ success: true, faqQuestion });
  } catch (err) {
    console.log("🚀 ~ file: faq.js ~ line 255 ~ read us ~ error", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const readFaqCategoryById = async (req, res) => {
  try {
    const id = req.params.id;
    const faqCategory = await readCategory(id);
    res.status(200).json({ success: true, faqCategory });
  } catch (err) {
    console.log("🚀 ~ file: faq.js ~ line 255 ~ read us ~ error", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const updateFaqCategory = async (req, res) => {
  try {
    const id = req.params.id;
    await updateCategoryById(id, req.body);

    const content = makeHistoryContent(
        req.user.name,
        '',
        'updated',
        `a category`
        ,` "${req.body.title}".`)
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);

    res.status(StatusCodes.OK).send({ success: "success" });
  } catch (err) {
    console.log(
      "🚀 ~ file: controllers / faq.js ~ line 85 ~ update ~ err",
      err
    );
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateFaqQuestion = async (req, res) => {
  try {
    const id = req.params.id;
    await updateQuestionById(id, req.body);


    const content = makeHistoryContent(
        req.user.name,
        '',
        'updated',
        `a question`
        ,` "${req.body.title}".`)
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);

    res.status(StatusCodes.OK).send({ success: "success" });
  } catch (err) {
    console.log(
      "🚀 ~ file: controllers / faq.js ~ line 85 ~ update ~ err",
      err
    );
    res.status(500).json({ success: false, error: err.message });
  }
};

const removeFaqQuestion = async (req, res) => {
  try {
    const id = req.params.id;

    const question = await readQuestion(id);

    await deleteQuestionById(id);

    const content = makeHistoryContent(
        req.user.name,
        '',
        'deleted',
        `a question`
        ,` "${question?.title}".`)
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);

    res.status(StatusCodes.OK).json({ success: true });
  } catch (err) {
    console.log(
      "🚀 ~ file: controllers / faq.js ~ line 98 ~ remove ~ err",
      err
    );
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const removeFaqCategory = async (req, res) => {
  try {

    const id = req.params.id;

    const category = await readCategory(id);

    await deleteCategoryById(id);


    const content = makeHistoryContent(
        req.user.name,
        '',
        'deleted',
        `a category`
        ,` "${category.title}".`)
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);
    res.status(StatusCodes.OK).json({ success: true });
  } catch (err) {
    console.log(
      "🚀 ~ file: controllers / faq.js ~ line 98 ~ remove ~ err",
      err
    );
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

module.exports = {
  createFaqCategory,
  createFaqQuestion,
  readFaqCategories,
  readFaqQuestions,
  updateFaqCategory,
  updateFaqQuestion,
  removeFaqCategory,
  removeFaqQuestion,
  readFaqQuestionById,
  readFaqCategoryById
};
