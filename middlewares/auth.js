const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticated = async (req, res, next) => {
  let token = req.headers["authorization"];

  if (!(token && token.toLowerCase().startsWith("bearer"))) {
    return res.status(401).json({ success: false, msg: "Not Authorized" });
  }
  try {
    token = token.split(" ")[1];
    const decoded = await jwt.decode(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ success: false, msg: "Not Authorized" });
    }

    const userAccount = await User.findOne({ _id: decoded.user.id }).select(
      "-password"
    );

    if (!userAccount) {
      return res.status(404).json({ success: false, msg: "Invalid User!" });
    }

    req.user = userAccount;
    next();
  } catch (err) {
    console.log(
      "🚀 ~ file: middlewares / auth.js ~ line 16 ~ authenticated ~ err",
      err
    );
    res.status(500).json({ success: false, error: err.message });
  }
};

const isAdmin = (req, res, next) => {
  try {
    console.log(
      "🚀 ~ file: middleware / auth.js ~ line 24 ~ isAdmin ~ req?.user?.role",
      req?.user?.role
    );
    if (req?.user?.role === "admin") {
      next();
    } else {
      return res.status(401).json({ success: false, msg: "UnAuthorized" });
    }
  } catch (error) {
    console.log(
      "🚀 ~ file: middlewares / auth.js ~ line 24 ~ isAdmin ~ error",
      error.message
    );
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { authenticated, isAdmin };
