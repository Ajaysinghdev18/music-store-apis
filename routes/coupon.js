const express = require("express");
const { body } = require("express-validator");
const { readAll, update, } = require("../controllers/auction");
const { create, validate } = require("../controllers/coupon");

const { authenticated } = require("../middlewares/auth");

const router = express.Router();

router.post("/", authenticated, createValidationFor('create-coupon'), create);
router.get("/", authenticated, readAll);
router.patch("/:id", authenticated, update);
router.post("/validate", authenticated, createValidationFor('validate'), validate);


function createValidationFor(route) {
    console.log(route);
    switch (route) {
        case "create-coupon":
            return [
                body('discountPercentage')
                    .notEmpty()
            ];
        case "validate":
            return [
                body('code')
                    .notEmpty()
            ];
        default:
            return [];
    }
}

module.exports = router;
