const jwt = require("jsonwebtoken");
const createError = require("./createError");

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    if (error.name === "TokenExpiredError")
      throw createError(401, "Token is expired. Please Login");

    throw error;
  }
};

const generateToken = async (payload, req, res) => {
  try {
    const token = await jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: 360000
    });
    return token;
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { verifyToken, generateToken };
