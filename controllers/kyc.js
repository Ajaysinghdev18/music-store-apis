const { validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const axios = require("axios");
const fs = require("fs");
const crypt = require("crypto");
const FormData = require("form-data");
const { createMessage } = require("../services/message");
const { createKYC, getKYCDetailsById, allKYC, updKYCById, updUserKYCById, getKYCDataCount } = require('../services/kyc');
const AWS = require("aws-sdk");
const { KYC_UNDER_VERIFICATION, KYC_REJECTED, KYC_VERIFIED } = require("../constants/messages");
const { getByEmailTypeEmailTemplates, sendUserAndEmailValueNotification, sendKYCRejectedNotification } = require('../services/email');
const { readUser } = require("../services/user");
const User =  require('../models/User')

const STATUS = {
  NOT_VERIFIED: 'not-verified',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  UNDER_VERIFICATION: 'under-verification'
};

const createKYCRecord = async (req, res) => {

  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
  });
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, errors: errors.array() });
    }
    const kycCount = await getKYCDataCount();
    const request_id = `KYC-${req.user.id.slice(-7)}-${kycCount + 1}`
    let filesArray = Object.values(req.files);
    let promises = [];

    for (let i = 0; i < filesArray.length; i++) {
      let file = filesArray[i];
      promises.push(uploadLoadFileToS3(file[0]));
    }
    function uploadLoadFileToS3(ObjFile) {
      const fileStream = fs.createReadStream(ObjFile.path);
      let params = {
        Key: `KYC/${req.user.id}/${request_id}/${ObjFile.fieldname}`,
        Body: fileStream,
        Bucket: process.env.AWS_S3_BUCKET_NAME,
      };
      return new Promise(resolve => {
        s3.upload(params, async (err, data) => {
          if (err) {
            console.log("err", err);
          }
          resolve({ url: data.Location, fieldname: ObjFile.fieldname });
        });
      });
    }
    const urls = await Promise.all(promises);
    function getFileObject(file) {
      return {
        filename: file.filename,
        fieldname: file.fieldname
      };
    }
    const findFile = (fieldname) => {
      return urls.find((obj) => obj.fieldname === fieldname);
    }
    let faceId
    if (req.files?.faceId) {
      faceId = { ...getFileObject(req.files?.faceId[0]), url: findFile('faceId').url }
    }
    let idBack
    if (req.files?.idBack) {
      idBack = { ...getFileObject(req.files?.idBack[0]), url: findFile('idBack').url }
    }
    let idFront
    if (req.files?.idFront) {
      idFront = { ...getFileObject(req.files?.idFront[0]), url: findFile('idFront').url }
    }
    const kycData = {
      ...req.body,
      faceId,
      idFront,
      idBack,
      expiration: req.body.expiration,
      status: 'under-verification'
    }

    await createKYC({ ...kycData, _id: request_id, user: req.user.id });
    const userData = {
      KYCStatus: 'under-verification',
      isKYCVerified: false
    }
    await updUserKYCById(req.user.id, userData)
    await createMessage({
      owner: req.user.id,
      content: KYC_UNDER_VERIFICATION
    });
    const template = await getByEmailTypeEmailTemplates('kyc_under_verification')
    const user = await User.findOne({ _id: req.user.id });
    if(template){
      await sendUserAndEmailValueNotification({name: user.name, email: user.email}, template);
    }
    res
      .status(StatusCodes.CREATED)
      .json({ success: true, msg: "Your KYC is under Verification" });
  } catch (e) {
    console.log("err>>", e);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: e.message });
  }
}

const getAllKYCRecord = async (req, res) => {
  try {
    let { query, projection, options, } = req.query;
    let newQuery = {};

    if (query) {
      query = JSON.parse(query);
      Object.entries(query).map(([key, value]) => {
        newQuery[key] = value;
      }
      )
    }
    if (projection) {
      projection = JSON.parse(projection);
    }
    if (options) {
      options = JSON.parse(options);
    }

    let kycs = await allKYC(newQuery, projection, options).populate('user');
    const all = await allKYC(newQuery);

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

    res.status(StatusCodes.OK).json({ success: true, kycs, pagination });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching KYC data' });
  }
}

const getKYCById = async (req, res) => {
  try {
    const { id } = req.params;
    const kycData = await getKYCDetailsById(id).populate('user');
    res.status(StatusCodes.OK).json({ success: true, kyc: kycData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching KYC data' });
  }
}

const updateKYCById = async (req, res) => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
  });
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, errors: errors.array() });
    }
    const id = req.params.id;
    let faceId;
    let idFront;
    let idBack;
    let kycData;
    if (req?.files) {
      let filesArray = Object.values(req.files);
      let promises = [];

      for (let i = 0; i < filesArray.length; i++) {
        let file = filesArray[i];
        promises.push(uploadLoadFileToS3(file[0]));
      }
      function uploadLoadFileToS3(ObjFile) {
        const fileStream = fs.createReadStream(ObjFile.path);
        let params = {
          Key: `KYC/${req.body.userId}/${req.params.id}/${ObjFile.fieldname}`,
          Body: fileStream,
          Bucket: process.env.AWS_S3_BUCKET_NAME,
        };
        return new Promise(resolve => {
          s3.upload(params, async (err, data) => {
            if (err) {
              console.log("err", err);
            }
            console.log("s3>>>", { url: data.Location, fieldname: ObjFile.fieldname })
            resolve({ url: data.Location, fieldname: ObjFile.fieldname });
          });
        });
      }
      const urls = await Promise.all(promises);
      function getFileObject(file) {
        return {
          filename: file.filename,
          fieldname: file.fieldname
        };
      }
      const findFile = (fieldname) => {
        return urls.find((obj) => obj.fieldname === fieldname);
      }
      if (req.files?.faceId) {
        faceId = { ...getFileObject(req.files?.faceId[0]), url: findFile('faceId').url }
      }
      if (req.files?.idBack) {
        idBack = { ...getFileObject(req.files?.idBack[0]), url: findFile('idBack').url }
      }
      if (req.files?.idFront) {
        idFront = { ...getFileObject(req.files?.idFront[0]), url: findFile('idFront').url }
      }

      kycData = {
        ...req.body,
        faceId,
        idFront,
        idBack
      }
    } else {
      kycData = {
        ...req.body,
      }
    }
    const userData = {
      KYCStatus: req.body.status,
      isKYCVerified: req.body.verified
    }
    await updUserKYCById(req.body.userId, userData)
    await updKYCById(id, kycData);
    await createMessage({
      owner: req.body.userId,
      content: req.body.status === STATUS.REJECTED ? KYC_REJECTED : KYC_VERIFIED
    });
    if(req.body.status === STATUS.REJECTED){
      const template = await getByEmailTypeEmailTemplates('kyc_rejected')
      const user = await User.findOne({ _id: req.body.userId });
      if(template){
        await sendKYCRejectedNotification({name: user.name, email: user.email, reason: req.body.reason}, template);
      }
    }
    if(req.body.status === STATUS.VERIFIED){
      const template = await getByEmailTypeEmailTemplates('kyc_verifed')
      const user = await User.findOne({ _id: req.body.userId });
      if(template){
        await sendUserAndEmailValueNotification({name: user.name, email: user.email}, template);
      }
    }
    res
      .status(StatusCodes.CREATED)
      .json({ success: true, msg: "Update Successfully" });
  } catch (e) {
    console.log("err>>", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
}


const getAccessToken = async (req, res, next) => {
  const { userId } = req.query;
  const levelName = "basic-kyc-level";
  const data = null;

  const ts = Math.floor(Date.now() / 1000);
  var signature = crypt.createHmac("sha256", process.env.SUMSUB_SECRET_KEY);
  signature.update(
    ts +
    "POST" +
    `/resources/accessTokens?userId=${userId}&ttlInSecs=1200&levelName=${levelName}`
  );
  const headers = {
    Accept: "application/json",
    "X-App-Token": process.env.SUMSUB_APP_TOKEN,
    "X-App-Access-Ts": ts,
    "X-App-Access-Sig": signature.digest("hex")
  };
  if (data instanceof FormData) {
    signature.update(data?.getBuffer());
  } else if (data) {
    signature.update(null);
  }
  var url = `https://api.sumsub.com/resources/accessTokens?userId=${userId}&ttlInSecs=1200&levelName=${levelName}`;
  try {
    let response;
    let data;
    response = await axios.post(url, data, { headers });
    data = response.data;
    res.status(StatusCodes.OK).json({
      success: true,
      data
    });
  } catch (e) {
    res.status(404).json({ success: false, error: "Api error" });
  }
};

const getApplicationStatus = async (req, res, next) => {
  try {
    const userApplication = await readUser({ _id: req.user._id });
    const data = {
      reviewResult: {
        reviewAnswer: ''
      }
    }
    if (userApplication?.isKYCVerified) {
      data.reviewResult.reviewAnswer = 'GREEN'
    }
    res.status(StatusCodes.OK).json({ success: true, msg: "Status", data });
  } catch (err) {
    console.log("🚀 ~ file: kyc.js:333 ~ getApplicationStatus ~ err:", err)
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};


module.exports = { getAccessToken, updateKYCById, getApplicationStatus, createKYCRecord, getAllKYCRecord, getKYCById };
