const { validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const { makeHistoryContent } = require("../utils/helpers");

const {
  createArticle,
  readArticleById,
  readAllArticle,
  deleteArticleById,
  updateArticleById
} = require("../services/article");
const { createHistory } = require("../services/history");
const AWS = require("aws-sdk");
const fs = require("fs");

const create = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, errors: errors.array() });
    }
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
    });
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
      let thumbnail = {
        filename: req.file.filename,
        fieldname: req.file.fieldname
      };
      console.log(req.body.title);
      console.log(req.body.description);
      const article = {
        ...req.body,
        title: JSON.parse(req.body.title),
        description: JSON.parse(req.body.description),
        thumbnail,
        author: req.user.name
      };
      await createArticle(article);

      const content = makeHistoryContent(
        req.user.name,
        "",
        "created",
        `a ${article.author}'s article`,
        ` "${article.title.en}".`
      );
      const history = {
        user: req.user,
        content: content
      };
      await createHistory(history);

      res
        .status(StatusCodes.CREATED)
        .json({ success: true, msg: "Article created!" });
    });
  } catch (err) {
    console.log(err);
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

    let articles = await readAllArticle(newQuery, projection, options);
    let all = await readAllArticle(newQuery);

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

    res.status(StatusCodes.OK).json({ success: true, articles, pagination });
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
    const article = await readArticleById(id);

    if (!article) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, msg: "Not Found" });
    }

    res.status(StatusCodes.OK).json({ success: true, article });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const id = req.params.id;
    const article = await readArticleById(id);

    await deleteArticleById(id);

    const content = makeHistoryContent(
      req.user.name,
      "",
      "deleted",
      `a ${article.author}'s article`,
      ` "${article.title}".`
    );
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);

    res
      .status(StatusCodes.OK)
      .json({ success: true, msg: "Article deleted successfully!" });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const update = async (req, res) => {
  const id = req.params.id;
  if (req.file) {
    try {
      const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
      });
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
        const thumbnail = {
          filename: req.file.filename,
          fieldname: req.file.fieldname
        };
        const article = {
          ...req.body,
          title: JSON.parse(req.body.title),
          description: JSON.parse(req.body.description),
          thumbnail,
          author: req.user.name
        };
        await updateArticleById(id, article);

        const updatedArticle = await readArticleById(id);
        const content = makeHistoryContent(
          req.user.name,
          "",
          updatedArticle.status.toLowerCase(),
          `a ${updatedArticle.author}'s article`,
          ` "${updatedArticle.title.en}".`
        );
        const history = {
          user: req.user,
          content: content
        };
        await createHistory(history);

        res.status(StatusCodes.OK).json({ success: true });
      });
    } catch (err) {
      console.log(err);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: err.message });
    }
  } else {
    try {
      const article = {
        ...req.body,
        title: JSON.parse(req.body.title),
        description: JSON.parse(req.body.description),
        author: req.user.name
      };
      await updateArticleById(id, article);

      const updatedArticle = await readArticleById(id);
      const content = makeHistoryContent(
        req.user.name,
        "",
        updatedArticle.status.toLowerCase(),
        `a ${updatedArticle.author}'s article`,
        ` "${updatedArticle.title.en}".`
      );
      const history = {
        user: req.user,
        content: content
      };
      await createHistory(history);

      res.status(StatusCodes.OK).json({ success: true });
    } catch (e) {
      console.log(err);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: err.message });
    }
  }
};

const toggleFeatured = async (req, res) => {
  try {
    const { id, isFeatured } = req.body;
    await updateArticleById(id, { isFeatured });

    const article = await readArticleById(id);

    const content = makeHistoryContent(
      req.user.name,
      "",
      isFeatured ? "featured" : "disfeatured",
      `a ${article.author}'s article`,
      ` "${article.title}".`
    );
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);

    res.status(StatusCodes.OK).json({ success: true });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

module.exports = {
  create,
  read,
  readAll,
  remove,
  update,
  toggleFeatured
};
