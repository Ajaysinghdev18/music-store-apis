const { StatusCodes } = require("http-status-codes");
const { validationResult } = require("express-validator");


const {
  readTerm,
  updateTerm,
  createTerm,
} = require("../services/term");

const { makeHistoryContent } = require("../utils/helpers");
const { createHistory } = require("../services/history");

const create = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, errors: errors.array() });
    }

    const data = await createTerm(req.body);

    const content = makeHistoryContent(
      req.user.name,
      '',
      'created',
      `an term policy`
      ,` "${req.body.title}".`)
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);

    res.status(StatusCodes.OK).send({ success: "success", body: data });
  } catch (err) {
    console.log("🚀 ~ file: controllers / us.js ~ line 85 ~ update ~ err", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


const read = async (req, res) => {
  try {
    const data = await readTerm();

    res.status(StatusCodes.OK).json({ success: true, body: data });
  } catch (err) {
    console.log("🚀 ~ file: us.js ~ line 255 ~ read us ~ error", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};


const update = async (req, res) => {
  try {
    const data = await updateTerm(req.body);
    const content = makeHistoryContent(
      req.user.name,
      '',
      'updated',
      `a term`
      ,` "${req.body.title}".`)
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);

    res.status(StatusCodes.OK).send({ success: true, body: data });
  } catch (err) {
    console.log("🚀 ~ file: controllers / us.js ~ line 85 ~ update ~ err", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  create,
  read,
  update,
};
