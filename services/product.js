const Product = require("../models/Product");

const createProductDoc = object => {
  return Product.create(object);
};

const allProducts = (query = {}, projection = null, options = {}) => {
  return Product.find(query, projection, options);
};

const aggregateProducts = pipeline => {
  console.log(pipeline);
  return Product.aggregate(pipeline);
};

const productById = id => {
  return Product.findOne({ _id: id });
};
const productByArtistID = id => {
  return Product.find({ artistId: id });
};

const productByName = name => {
  console.log("🚀 ~ file: product.js:24 ~ productByName ~ name:", name)
  return Product.findOne({ productURLId: name });
};

const delProductById = id => {
  return Product.findByIdAndDelete({ _id: id });
};

const updProductById = (productId, productData) => {
  return Product.findByIdAndUpdate(productId, productData, {
    new: true
  });
};

const removeProductKey = (productId, field, value) => {
  return Product.findByIdAndUpdate(productId, { $unset: { [field]: value } }, {
    new: true
  });
};

module.exports = {
  createProductDoc,
  allProducts,
  aggregateProducts,
  productById,
  productByName,
  delProductById,
  updProductById,
  productByArtistID,
  removeProductKey
};
