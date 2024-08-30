const Cart = require("../models/Cart");

const createCart = obj => Cart.create(obj);

const getCart = obj => Cart.findOne(obj);

const updateCart = (fingerprint, object) =>
  Cart.findOneAndUpdate({ fingerprint }, object, { new: true });
const deleteCart = id => Cart.findByIdAndDelete({ _id: id });

const removeCartKey = (cartId, field, value) => {
  return Cart.findByIdAndUpdate(cartId, { $unset: { [field]: value } }, {
    new: true
  });
};

module.exports = { createCart, getCart, updateCart, deleteCart, removeCartKey };
