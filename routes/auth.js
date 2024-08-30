const express = require("express");
const { check, oneOf } = require("express-validator");
const { StatusCodes } = require("http-status-codes");

const {
  registerUser,
  verifyUser,
  userLogin,
  forgotPassword,
  resetPasswordByToken,
  getUserAccount,
} = require("../controllers/auth");
const { authenticated, isAdmin} = require("../middlewares/auth");
const router = express.Router();

router.post("/register", createValidationFor("register"), registerUser);
router.post("/verify", verifyUser);
router.post("/login", createValidationFor("login"), userLogin);
router.post(
  "/forgot-password",
  createValidationFor("forgot-password"),
  forgotPassword
);
router.post(
  "/reset-password",
  createValidationFor("reset-password"),
  resetPasswordByToken
);
router.get("/me", authenticated, getUserAccount);

function createValidationFor(route) {
  console.log(route);
  switch (route) {
    case "register":
      return [
        oneOf([
          check("email")
            .isEmail()
            .withMessage("Must be valid email"),
          check("username")
            .isLength({ min: 6 })
            .withMessage("Minimum 8 character long")
        ]),
        check("password")
          .isLength({ min: 8 })
          .withMessage("Minimum 8 character long")
      ];
    case "login":
      return [
        oneOf([
          check("email")
            .isEmail()
            .withMessage("Must be valid email"),
          check("username")
            .isLength({ min: 6 })
            .withMessage("Minimum 8 character long")
        ]),
        check("password")
          .isLength({ min: 8 })
          .withMessage("Minimum 8 character long")
      ];
    case "forgot-password":
      return [
        oneOf([
          check("email")
            .isEmail()
            .withMessage("Must be valid email"),
          check("username")
            .isLength({ min: 6 })
            .withMessage("Minimum 8 character long")
        ])
      ];
    case "reset-password":
      return [
        check("password")
          .isLength({ min: 8 })
          .withMessage("Minimum 8 character long")
      ];

    default:
      return [];
  }
}

module.exports = router;
