const { StatusCodes } = require("http-status-codes");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const randomstring = require("randomstring");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const { createUser, readUser, updateUser } = require("../services/user");
const { generatePasswordHash, matchPasswordHash } = require("../services/auth");
const {
  sendForgotPasswordEmail,
  sendUserAndEmailValueNotification,
  sendNewTokenEmail,
  getByEmailTypeEmailTemplates
} = require("../services/email");
const Token = require("../models/Token");
const User = require("../models/User");
const { generateToken } = require("../utils/jwt");
const { createBalanceForUser } = require("../services/balance");
const { createAccountKeys } = require("../utils/cspr");
const { createWalletDoc } = require("../services/wallet");
const {
  encryptDataWithPassphrase,
} = require("../utils/helpers");
const ethers = require("ethers");
const crypto = require("crypto");

const registerUser = async (req, res, next) => {
  try {
    const { email, password, name, username } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, errors: errors.array() });
    }
    let isUserExist = await readUser({ email: email.toUpperCase() });
    if (isUserExist) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ success: false, msg: "Email already exist" });
    }
    let isUsernameExist = await readUser({ username });
    if (isUsernameExist) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ success: false, msg: "Username already exist" });
    }
    const keys = createAccountKeys();
    req.body.casperWalletAddress = keys.accountAddress;
    const privateKeyData = fs
      .readFileSync(keys.privateKeyPath, "utf8")
      .toString();
    const publicKeyData = fs
      .readFileSync(keys.publicKeyPath, "utf8")
      .toString();
    const user = await createUser({
      ...req.body,
      email: req.body.email.toLowerCase(),
      // verify: true,
    });
    var token = crypto.randomBytes(64).toString('hex');

    await encryptDataWithPassphrase(privateKeyData, async data => {
      try {
        await createWalletDoc({
          isConnected: true,
          default: true,
          privateKey: data.encrypted,
          address: keys.accountAddress,
          publicKey: publicKeyData,
          chain: "CSPR",
          userId: user.id,
          name: "Default",
          iv: data.iv
        });
      } catch (error) {
        console.log(
          "🚀 ~ file: auth.js:64 ~ awaitencryptDataWithPassphrase ~ error:",
          error
        );
      }
    });
    let id = crypto.randomBytes(32).toString("hex");
    let ethPrivateKey = "0x" + id;
    await encryptDataWithPassphrase(ethPrivateKey, async data => {
      try {
        let wallet = new ethers.Wallet(ethPrivateKey);
        await createWalletDoc({
          isConnected: true,
          default: true,
          privateKey: data.encrypted,
          address: wallet.address,
          chain: "ETH",
          userId: user.id,
          name: "Default",
          iv: data.iv
        });
      } catch (error) {
        console.log(
          "🚀 ~ file: auth.js:83 ~ awaitencryptDataWithPassphrase ~ error:",
          error
        );
      }
    });
    let userToken = new Token({
      userId: user.id,
      token: token
    });

    await userToken.save();

    const template = await getByEmailTypeEmailTemplates('email_verification')
    await sendNewTokenEmail({ name: name, email: email }, token, template)

    await createBalanceForUser(user._id);
    fs.unlinkSync(keys.privateKeyPath);
    fs.unlinkSync(keys.publicKeyPath);
    res
      .status(StatusCodes.CREATED)
      .json({ success: true, msg: "Successfully registered!" });
  } catch (err) {
    console.log("🚀 ~ file: auth.js:63 ~ registerUser ~ err:", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const verifyUser = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res
        .status(404)
        .json({ success: false, msg: "Provide Your Token" });
    }
    const tokenUser = await Token.findOne({ token });

    if (!tokenUser) {
      return res
        .status(404)
        .json({ success: false, msg: "Invalid Verify Code!" });
    }
    const user = await User.findOne({ _id: tokenUser.userId });

    if (!user) {
      return res.status(404).json({ success: false, msg: "Invalid User!" });
    }

    await updateUser(user.id, { verify: true });
    await user.save();

    const template = await getByEmailTypeEmailTemplates('user_welcome')
    if(template){
      await sendUserAndEmailValueNotification({name: user.name, email: user.email}, template);
    }
    res
      .status(StatusCodes.CREATED)
      .json({ success: true, msg: "Successfully registered!" });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const userLogin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, errors: errors.array() });
    }
    const { email, password, username } = req.body;
    let user = await readUser({ email: email.toLowerCase() });
    if (!user) {
      user = await readUser({ username });
    }
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, msg: "Invalid Credentials!" });
    }

    const isMatch = await matchPasswordHash(password, user.password);
    console.log("isMatch", isMatch);
    if (!isMatch) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, msg: "Invalid Credentials" });
    }

    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };

    const token = await generateToken(payload);
    const loginUser = await readUser({ email: user.email }).select("-password");

    res.status(StatusCodes.OK).json({ success: true, user: loginUser, token });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array() });
    }
    const { email } = req.body;
    const user = await readUser({ email });
    if (!user) {
      return res.status(404).json({ success: false, msg: "Invalid Email !" });
    }
    var token = crypto.randomBytes(64).toString('hex');
    let userToken = new Token({
      userId: user.id,
      token: token
    });

    await userToken.save();

    await sendForgotPasswordEmail(user, token);

    res.status(200).json({ success: true, msg: "Token sent to your email" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const resetPasswordByToken = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token) {
      return res
        .status(404)
        .json({ success: false, msg: "Provide Your Token" });
    }
    const tokenUser = await Token.findOne({ token });

    if (!tokenUser) {
      return res
        .status(404)
        .json({ success: false, msg: "Invalid Verify Code!" });
    }
    const user = await User.findOne({ _id: tokenUser.userId }).select(
      "-password"
    );
    if (!user) {
      return res.status(404).json({ success: false, msg: "Invalid User!" });
    }

    const salt = await bcrypt.genSalt(10);
    let newHashedPassword = await generatePasswordHash(newPassword, salt);
    let updateUserWithNewPassword = { password: newHashedPassword };
    let resultUser = await updateUser(user.id, updateUserWithNewPassword);
    await user.save();
    res.status(200).json({ success: true, resultUser, msg: "You Verified !" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const userGoogleLogin = async (req, res, next) => {
  try {
    const { tokenId } = req.body;
    const response = await client.verifyIdToken({
      idToken: tokenId,
      audience:
        "577210671376-f8jma6jbeh2ise31rgp23jv42hfmbpgg.apps.googleusercontent.com"
    });
    const { email_verified, name, email } = response.payload;
    console.log(
      "🚀 ~ file: auth.js ~ line 216 ~ userGoogleLogin ~ email_verified",
      email_verified
    );
    if (email_verified) {
      let user = await User.findOne({ email }).select("-password");
      if (user) {
        const payload = {
          user: {
            id: user.id,
            email: user.email,
            role: user.role
          }
        };

        const token = await generateToken(payload);
        return res
          .cookie("token", token, {
            expires: dayjs()
              .add(1, "days")
              .toDate(),
            httpOnly: true
          })
          .status(200)
          .json({ success: true, loginUser: user });
      } else {
        const password = name + process.env.JWT_SECRET;
        let newUser = new User({
          email,
          password,
          role: "user"
        });
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);

        await newUser.save();
        const payload = {
          user: {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role
          }
        };
        const token = await generateToken(payload);
        return res
          .cookie("token", token, {
            expires: dayjs()
              .add(1, "days")
              .toDate(),
            httpOnly: true
          })
          .status(200)
          .json({ success: true, loginUser });
      }
    } else {
      return res
        .status(400)
        .json({ success: false, msg: "Something Wrong at Google" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getUserAccount = async (req, res, next) => {
  res.status(200).json({ success: true, user: req.user });
};

module.exports = {
  registerUser,
  userLogin,
  forgotPassword,
  verifyUser,
  resetPasswordByToken,
  userGoogleLogin,
  getUserAccount
};
