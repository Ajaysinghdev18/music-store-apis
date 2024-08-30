const bcrypt = require("bcrypt");

const User = require("../models/User");
const { generatePasswordHash, matchPasswordHash } = require("./auth");
const createError = require("../utils/createError");

const createUser = async user => {
  const salt = await bcrypt.genSalt(10);
  user.password = await generatePasswordHash(user.password, salt);
  return User.create(user);
};

const readUser = user => {
  return User.findOne(user);
};
const readUserByEmail = user => {
  return User.find(user);
};
const readAllUsers = (query, projection, options) => {
  return User.find(query, projection, options).select("-password");
};

const aggregateUsers = pipeline => {
  return User.aggregate(pipeline);
};

const updateUser = (id, user) => {
  return User.findByIdAndUpdate(id, user, {
    new: true,
    runValidators: true
  });
};

const removeUser = id => {
  return User.findByIdAndDelete({ _id: id });
};

const resetUserPassword = async id => {
  const user = await User.findById(id);
  console.log("----------User Info----------", user);
  const isMatch = await matchPasswordHash("1234567890", user.password);
  console.log("---------", isMatch);
  const salt = await bcrypt.genSalt(10);
  user.password = await generatePasswordHash("1234567890", salt);
  await user.save();
};

const updateUserPassword = async (id, req) => {
  const user = await User.findById(id);
  console.log("----------User Info----------", user);
  let isMatch;
  if (req.user.role === 'admin') {
    isMatch = true;
  }
  else {
    isMatch = await matchPasswordHash(req.body.oldPassword, user.password);
  }

  if (isMatch) {
    const salt = await bcrypt.genSalt(10);
    user.password = await generatePasswordHash(req.body.newPassword, salt);
    await user.save();
  } else {
    throw createError(500, "Current password is incorrect.");
  }
};

const changeUserPasswordByAdmin = async (id, req) => {
  const user = await User.findById(id);
  console.log("----------User Info----------", user);
  if (req.user.role === 'admin') {
    const salt = await bcrypt.genSalt(10);
    user.password = await generatePasswordHash(req.body.newPassword, salt);
    console.log('success password', user.password, req.body.newPassword);
    await user.save();
  } else {
    throw createError(500, "Current password is incorrect.");
  }
};


module.exports = {
  readUser,
  createUser,
  readAllUsers,
  aggregateUsers,
  removeUser,
  updateUser,
  resetUserPassword,
  readUserByEmail,
  updateUserPassword,
  changeUserPasswordByAdmin,
};
