const { validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const { createCoupon, readAllCoupons, updateCoupon, getCouponById, getCoupon } = require("../services/coupon");
const { generateCouponCode } = require("../utils/helpers");


const create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, errors: errors.array() });
    }
    const { user, body: { discountPercentage } } = req;
    const code = generateCouponCode();
    const newCoupon = {
      user: user._id,
      discountPercentage,
      code,
      isValid: true
    }
    const coupon = await createCoupon(newCoupon);

    res.status(StatusCodes.CREATED).json({ success: true, coupon });
  } catch (err) {
    console.log("🚀 ~ file: balance.js ~ line 22 ~ getBalance ~ err", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};



const readAll = async (req, res) => {
  try {
    let { query, projection, options } = req.query;
    let newQuery = {};
    if (query) {
      query = JSON.parse(query);
      Object.entries(query).map(([key, value]) => {
        newQuery[key] = value;
      });
    }

    if (projection) {
      projection = JSON.parse(projection);
    }
    if (options) {
      options = JSON.parse(options);
    }

    let coupons = await readAllCoupons(newQuery, projection, options)
    let all = await readAllCoupons(newQuery);

    let pageLimit;
    let pageNumber;
    if (options) {
      if (options.limit) {
        pageLimit = options.limit;

        if (options.skip) {
          pageNumber = options.skip / options.limit;
        }
      }
    }

    const pagination = {
      total: all.length,
      pageLimit,
      pageNumber
    };

    res.status(StatusCodes.OK).json({ success: true, coupons, pagination });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const update = async (req, res) => {
  const id = req.params.id
  try {
    await updateCoupon(id, req.body);
    res.status(StatusCodes.OK).json({ success: true });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};


const validate = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, errors: errors.array() });
  }
  const { code } = req.body;
  const { user } = req;

  try {
    const coupon = await getCoupon({ code });
    if (!coupon) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, isValid: false });
    }
    if (!coupon.user.equals(user._id) || !coupon.isValid) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, isValid: false });
    }

    res.status(StatusCodes.OK).json({ success: true, isValid: true, coupon });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};



module.exports = { create, readAll, update, validate };
