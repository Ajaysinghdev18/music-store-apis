const { validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");

const { readAll, createHistory } = require("../services/history");

const getHistory = async (req, res) => {
  try {
    const histories = await readAll({}, {}, { sort: { createdAt: -1 } });
    res.status(StatusCodes.OK).json({ success: true, histories: histories });
  } catch (err) {
    console.log("🚀 ~ file: faq.js ~ line 255 ~ read us ~ error", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const addHistory = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, errors: errors.array() });
    }

    await createHistory(history);

    res.status(StatusCodes.OK).send({ success: "success", history: history });
  } catch (err) {
    console.log(
      "🚀 ~ file: controllers / faq.js ~ line 85 ~ update ~ err",
      err
    );
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getHistory,
  addHistory
};
