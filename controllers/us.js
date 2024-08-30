const { StatusCodes } = require("http-status-codes");
const { validationResult } = require("express-validator");

const {
  readUs,
  updateUsById,
  deleteUsById,
  createUs,
  readUsById
} = require("../services/us");
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

    const data = await createUs(req.body);

    const content = makeHistoryContent(
        req.user?.name,
        '',
        'created',
        `an about us`
        ,` "${req.body.title.en}".`)
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

const readAll = async (req, res) => {
  try {
    const us = await readUs();

    res.status(200).json({ success: true, us });
  } catch (err) {
    console.log("🚀 ~ file: us.js ~ line 255 ~ read us ~ error", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await updateUsById(id, req.body);

    const content = makeHistoryContent(
        req.user?.name,
        '',
        'updated',
        `an about us`
        ,` "${data.title.en}".`)
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

const remove = async (req, res) => {
  try {
    const id = req.params.id;
    const usData = await readUsById(id);
    await deleteUsById(id);

    const content = makeHistoryContent(
        req.user.name,
        '',
        'deleted',
        `an about us`
        ,` "${usData.title.en}".`)
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);

    res.status(StatusCodes.OK).json({ success: true });
  } catch (err) {
    console.log("🚀 ~ file: controllers / us.js ~ line 98 ~ remove ~ err", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

module.exports = {
  create,
  readAll,
  update,
  remove
};
