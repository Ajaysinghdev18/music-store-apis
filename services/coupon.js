const Coupon = require("../models/Coupon");

const createCoupon = coupon => {
  return Coupon.create(coupon);
};

const updateCoupon = (couponId, data) => {
  return Coupon.findByIdAndUpdate(couponId, data, {
    new: true
  });
};

const getCoupon = condition => {
  return Coupon.findOne(condition);
};

const getCouponById = id => {
  return Coupon.findOne({ _id: id });
};

const removeKeyValue = (couponId, field, value) => {
  return Coupon.findByIdAndUpdate(couponId, { $unset: { field: value } }, {
    new: true
  });
};

const readAllCoupons = (query = {}, projection = null, options = {}) => {
  return Coupon.find(query, projection, options);
};


module.exports = {
  createCoupon,
  getCouponById,
  updateCoupon,
  readAllCoupons,
  removeKeyValue,
  getCoupon
};
