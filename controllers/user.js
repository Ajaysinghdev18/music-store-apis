const { StatusCodes } = require("http-status-codes");
const fs = require("fs");
const {
  createUser,
  readUser,
  readAllUsers,
  removeUser,
  updateUser,
  resetUserPassword,
  updateUserPassword,
  changeUserPasswordByAdmin,
  aggregateUsers
} = require("../services/user");
const {readArtistById} = require('../services/artist')
const { isEqualIds } = require("../utils/dbOperation");
const { getShopHistoryByUser } = require("../services/order");
const { readMessages, removeMessageById, updateMessagesByID } = require("../services/message");
const AWS = require("aws-sdk");
const { makeHistoryContent } = require("../utils/helpers");
const { createHistory } = require("../services/history");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const Artist = require("../models/Artist");
const create = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, errors: errors.array() });
    }

    const user = await readUser({ email: req.body.email }).select('name');
    console.log(user, req.body.email);
    if (user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, msg: "Duplicated Email" });
    }

    await createUser({ ...req.body, email: req.body.email.toLowerCase() });

    const content = makeHistoryContent(
      req.user.name,
      "",
      "created",
      `one user`,
      ` "${req.body.name}".`
    );
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);

    res
      .status(StatusCodes.CREATED)
      .json({ success: true, msg: "user created!" });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const read = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await readUser({ _id: id }).select("-password");

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, msg: "Not Found" });
    }

    res.status(StatusCodes.OK).json({ success: true, user });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const readAll = async (req, res) => {
  try {
    let { query, projection, options, aggregate } = req.query;
    console.log(
      "🚀 ~ file: auth.js ~ line 255 ~ readAll ~ limit, skip, name",
      query,
      projection,
      options,
      aggregate
    );

    if (aggregate) {
      aggregate = JSON.parse(aggregate);

      let users = await aggregateUsers(aggregate);
      res.status(200).json({ success: true, users });
    } else {
      let newQuery = {};
      if (query) {
        query = JSON.parse(query);
        Object.entries(query).map(([key, value]) => {
          if (typeof value === "string") {
            newQuery[key] = new RegExp(`${value}`, "i");
          } else {
            newQuery[key] = value;
          }
        });
      }

      if (projection) {
        projection = JSON.parse(projection);
      }
      if (options) {
        options = JSON.parse(options);
      }

      const users = await readAllUsers(newQuery, projection, options);
      const all = await readAllUsers(newQuery);

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

      res.status(200).json({ success: true, users, pagination });
    }
  } catch (error) {
    console.log("🚀 ~ file: auth.js ~ line 255 ~ getAllusers ~ error", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const id = req.params.id;
    await updateUser(id, req.body);
    const content = makeHistoryContent(
      req.user.name,
      "",
      "updated",
      `the account of`,
      ` "${req.body.name}".`
    );
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);

    res.status(StatusCodes.OK).send({ success: "success" });
  } catch (err) {
    console.log(
      "🚀 ~ file: controllers / user.js ~ line 85 ~ update ~ err",
      err
    );
    res.status(500).json({ success: false, error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await readUser({ _id: id });

    await removeUser(id);
    const content = makeHistoryContent(
      `"${user.name}"`,
      "'s the account was ",
      "deleted",
      ` by`,
      ` "${req.user.name}".`
    );
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);

    res.status(StatusCodes.OK).json({ success: true });
  } catch (err) {
    console.log(
      "🚀 ~ file: controllers / user.js ~ line 98 ~ remove ~ err",
      err
    );
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const id = req.params.id;
    await resetUserPassword(id);
    const user = await readUser({ _id: id });

    const content = makeHistoryContent(
      `"${user.name}"`,
      "'s the password was",
      "reseted",
      `by`,
      ` "${user.name}".`
    );
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);

    res.status(StatusCodes.OK).json({ success: true });
  } catch (err) {
    console.log(
      "🚀 ~ file: controllers / user.js ~ line 98 ~ remove ~ err",
      err
    );
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const id = req.params.id;
    await updateUserPassword(id, req);
    const user = await readUser({ _id: id });

    const content = makeHistoryContent(
      `"${user.name}"`,
      "'s the password was ",
      "updated",
      `by`,
      ` "${req.user.name}".`
    );
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);

    res.status(StatusCodes.OK).json({ success: true });
  } catch (err) {
    console.log(
      "🚀 ~ file: controllers / user.js ~ line 98 ~ remove ~ err",
      err
    );
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, msg: err.message });
  }
};

const changePasswordByAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    await changeUserPasswordByAdmin(id, req);
    const user = await readUser({ _id: id });

    const content = makeHistoryContent(
      `"${user.name}"`,
      "'s the password was ",
      "changed",
      `by`,
      ` "${req.user.name}".`
    );
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);

    res.status(StatusCodes.OK).json({ success: true });
  } catch (err) {
    console.log(
      "🚀 ~ file: controllers / user.js ~ line 98 ~ change ~ err",
      err
    );
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, msg: err.message });
  }
};

const getFavorites = async (req, res) => {
  try {
    const id = req.params.id || req.user.id;
    const account = await readUser({ _id: id }).populate({
      path: "favoriteProducts",
      populate: {
        path: 'category'
      }
    });

    for (let i = 0; i < account.favoriteProducts.length; i++) {
      const product = account.favoriteProducts[i];
      const artistDetails = await readArtistById(product.artistId);
    
      if (artistDetails) {
        const data = { ...product.artistDetails, artistURLId: artistDetails.artistURLId };
        product.artistDetails = data;
      }
    }
    if (!account) {
      return res.status(404).json({ success: false, msg: "There is no data!" });
    }

    res
      .status(200)
      .json({ success: true, favoriteProducts: account.favoriteProducts });
  } catch (err) {
    console.log(
      "🚀 ~ file: controllers / user.js ~ line 129 ~ get favorites ~ err",
      err
    );
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const getSubscribedArtist = async (req, res) => {
  try {
    const id = req.params.id || req.user.id;
    const account = await readUser({ _id: id }).populate({
      path: "subscribedArtist",
    });

    if (!account) {
      return res.status(404).json({ success: false, msg: "There is no data!" });
    }

    res
      .status(200)
      .json({ success: true, subscribedArtist: account.subscribedArtist });
  } catch (err) {
    console.log(
      "🚀 ~ file: controllers / user.js ~ line 129 ~ get favorites ~ err",
      err
    );
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
    });
    
    const id = req.params.id;
    const body = req.file;
    const fileStream = fs.createReadStream(body.path);
    const params = {
      Key: `${body.fieldname}/${body.filename}`,
      Body: fileStream,
      Bucket: process.env.AWS_S3_BUCKET_NAME
    };
    s3.upload(params, async (err, data) => {
      if (err) {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ success: false, error: err.message });
        console.log(err);
      }
      console.log("data", data);
      let avatar = {
        filename: req.file.filename,
        fieldname: req.file.fieldname,
        url: data.Location
      };
      const user = await updateUser(id, { avatar });
      const userH = await readUser({ _id: id });

      const content = makeHistoryContent(
        `"${userH.name}"`,
        "'s the avatar was",
        "updated",
        `by`,
        ` "${userH.name}".`
      );
      const history = {
        user: req.user,
        content: content
      };
      await createHistory(history);

      res.status(StatusCodes.OK).json({ success: true, user });
    });
  } catch (err) {
    console.log(
      "🚀 ~ file: controllers / user.js ~ line 213 ~ update avatar ~ err",
      err
    );
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const user = req.user;
    let { query = "{}", projection, options } = req.query;

    if (query) {
      query = JSON.parse(query);
      query.owner = user.id;
    }
    if (projection) {
      projection = JSON.parse(projection);
    }
    if (options) {
      options = JSON.parse(options);
    }
    const messages = await readMessages(query, projection, options);

    res.status(200).json({ success: true, messages: messages });
  } catch (err) {
    console.log(
      "🚀 ~ file: controllers / user.js ~ line 129 ~ get favorites ~ err",
      err
    );
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const removeMessage = async (req, res) => {
  try {
    const id = req.params.id;
    await removeMessageById(id);

    res.status(StatusCodes.OK).json({ success: true });
  } catch (err) {
    console.log(
      "🚀 ~ file: controllers / user.js ~ line 213 ~ remove ~ err",
      err
    );
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};
const updateMessage = async (req, res) => {
  try {
    const id = req.params.id;
    const ress = await updateMessagesByID(id, req.body);

    res.status(StatusCodes.OK).json({ success: true });
  } catch (err) {
    console.log(
      "🚀 ~ file: controllers / user.js ~ line 213 ~ remove ~ err",
      err
    );
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};
const getShopHistory = async (req, res) => {
  try {
    const id = req?.user?.id ? req.user.id : req.params.id;

    const history = await getShopHistoryByUser(id);

    res.status(StatusCodes.OK).json({ success: true, history });
  } catch (err) {
    console.log(
      "🚀 ~ file: controllers / user.js ~ line 213 ~ remove ~ err",
      err
    );
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const toggleKYCVerified = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await readUser({ _id: id });
    const newUser = await updateUser(id, {
      isKYCVerified: !user.isKYCVerified
    });

    const content = makeHistoryContent(
      req.user.name,
      "",
      user.isKYCVerified ? "verified" : "unverified",
      "the",
      ` ${user.name}'s `,
      "account in Administrator."
    );

    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);

    res.status(StatusCodes.OK).json({ success: true, user: newUser });
  } catch (err) {
    console.log(
      "🚀 ~ file: controllers / user.js ~ line 273 ~ toggle KYC verified ~ err",
      err
    );
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const subscribeArtistToggle = async (req, res) => {
  try{
    const { userId, artistId } = req.body;
    const targetUser = await User.findById(userId);
    const targetArtist = await Artist.findById(artistId);
    if (targetUser && targetArtist) {
      const matchedIndex = targetUser.subscribedArtist.findIndex(id =>
        isEqualIds(id, artistId)
      );
      if (matchedIndex === -1) {
        targetUser.subscribedArtist.push(artistId);
      }
      else {
        targetUser.subscribedArtist.splice(matchedIndex, 1);
      }
      const matchedArtistIndex = targetArtist.subscriber.findIndex(id =>
        isEqualIds(id, userId)
      );
      if (matchedArtistIndex ===  -1){
         targetArtist.subscriber.push(userId);
      }
      else {
        targetArtist.subscriber.splice(matchedArtistIndex, 1)
      }
      await targetArtist.save()
      await targetUser.save();
      return res.status(StatusCodes.OK).json({ success: true });
    }

    res.status(StatusCodes.OK).json({ success: true });
  }catch(err){
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
}
module.exports = {
  create,
  read,
  readAll,
  update,
  remove,
  resetPassword,
  getFavorites,
  updatePassword,
  updateAvatar,
  getMessages,
  removeMessage,
  getShopHistory,
  toggleKYCVerified,
  changePasswordByAdmin,
  updateMessage,
  subscribeArtistToggle,
  getSubscribedArtist
};
