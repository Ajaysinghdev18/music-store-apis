const Gallery = require("../models/Gallery");
const Mint = require("../models/Nft");

const createGalleryDoc = gallery => {
  return Gallery.create(gallery);
};

const allGalleries = (query = {}, projection = null, options = {}) => {
  return Gallery.find(query, projection, options);
};

const allNftsByContractId = (query = {}, projection = null, options = {}) => {
  return Mint.find(query, projection, options);
};

const aggregateGalleries = pipeline => {
  return Gallery.aggregate(pipeline);
};

const galleryById = id => {
  return Gallery.findOne({ _id: id });
};

const galleryByName = name => {
  return Gallery.findOne({ galleryURLId : name });
};

const updGalleryById = (id, gallery) => {
  return Gallery.findByIdAndUpdate(id, gallery, { new: true });
};

const deleteGalleryById = id => {
  return Gallery.findByIdAndDelete({ _id: id });
};

module.exports = {
  createGalleryDoc,
  allGalleries,
  aggregateGalleries,
  galleryById,
  galleryByName,
  updGalleryById,
  allNftsByContractId,
  deleteGalleryById
};
