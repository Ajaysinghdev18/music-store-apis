const Service = require("../models/Service");



const readServices = (condition) => {
  return Service.find(condition);
};

const readService = (condition) => {
  return Service.findOne(condition);
};


const createService = (service) => {
  return Service.create(service);
};

const removeService = (id) => {
  return Service.findOneAndDelete(id);
};





module.exports = { readServices, readService, createService, removeService };
