const Contract = require("../models/Contract");
const Nft = require("../models/Nft");

const createContractDoc = contract => {
  return Contract.create(contract);
};

const allContracts = (query = {}, projection = null, options = {}) => {
  return Contract.find(query, projection, options);
};
const allNfts = (query = {}, projection = null, options = {}) => {
  return Nft.find(query, projection, options);
};

const contractById = id => {
  return Contract.findOne({ _id: id });
};

const updateContractDoc = (condition, object) => {
  return Contract.findOneAndUpdate(condition, { $set: object }, { new: true });
};

const removeNftService = id => {
  return Nft.findByIdAndDelete({ _id: id });
};

module.exports = {
  createContractDoc,
  allContracts,
  contractById,
  updateContractDoc,
  allNfts,
  removeNftService,
};
