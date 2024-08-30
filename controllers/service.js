const { StatusCodes } = require("http-status-codes");
const { readServices, createService, removeService } = require("../services/service");

const readAllServices = async (req, res) => {
  try {
    let { query } = req.query;

    let newQuery = {};
    if (query) {
      query = JSON.parse(query);
      Object.entries(query).map(([key, value]) => {
        newQuery[key] = value;
      });
    }
    const services = await readServices(query)
    res.status(StatusCodes.OK).json({ success: true, services });
  } catch (err) {
    console.log("🚀 ~ file: service.js:30 ~ readAllServices ~ err:", err)
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};


const create = async (req, res) => {
  try {
    const service = await createService(req.body);
    res.status(StatusCodes.OK).json({ success: true, msg: 'Created!' });
  } catch (err) {
    console.log("🚀 ~ file: service.js:30 ~ readAllServices ~ err:", err)
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};


const remove = async (req, res) => {
  try {
    const id = req.params;
    await removeService(id);
    res.status(StatusCodes.OK).json({ success: true, msg: 'Removed!' });
  } catch (err) {
    console.log("🚀 ~ file: service.js:30 ~ readAllServices ~ err:", err)
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};




module.exports = { readAllServices, create, remove };
