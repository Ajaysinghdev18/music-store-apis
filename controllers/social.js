const { validationResult } = require("express-validator")
const { StatusCodes } = require("http-status-codes");
const {createSocial,readSocial,deleteSocial, updateSocialById, readAllSocialByArtist} = require('../services/social')
const AWS = require("aws-sdk");
const fs = require("fs");

const create = async (req, res) => {
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
      let filesArray = Object.values(req.files);
      let promises = [];
      for (let i = 0; i < filesArray.length; i++) {
        let file = filesArray[i];
        promises.push(uploadLoadFileToS3(file[0]));
      }
      function getFileObject(file) {
        return {
          filename: file.filename,
          fieldname: file.fieldname
        };
      }
      function uploadLoadFileToS3(ObjFile) {
        const fileStream = fs.createReadStream(ObjFile.path);
        let params = {
          Key: `${ObjFile.fieldname}/${ObjFile.filename}`,
          Body: fileStream,
          Bucket: process.env.AWS_S3_BUCKET_NAME,
        };
        if (ObjFile.mimetype === 'image/svg+xml') {
          params.ContentType = 'image/svg+xml'
        }
        return new Promise(resolve => {
          s3.upload(params, async (err, data) => {
            if (err) {
              console.log("err", err);
            }
            console.log('data.Location', data.Location)
            resolve({ url: data.Location, fieldname: ObjFile.fieldname });
          });
        });
      }
      const urls = await Promise.all(promises);
      const findFile = (fieldname) => {
        return urls.find((obj) => obj.fieldname === fieldname);
      }
      let thumbnail;
      if (req.files?.thumbnail) {
        thumbnail = { ...getFileObject(req.files?.thumbnail[0]), url: findFile('thumbnail').url };
      }
      let video;
      if (req.files?.video) {
        video = { ...getFileObject(req.files?.video[0]), url: findFile('video').url };
      }
      let attachment;
      if (req.files?.attachment) {
        attachment = { ...getFileObject(req.files?.attachment[0]), url: findFile('attachment').url };
      }
      const socialContent = {
        thumbnail,
        ...req.body,
      };
      if (req.body.contentType === "video"){
        socialContent.video = video
      }
      if (req.body.contentType === "attachment"){
        socialContent.attachment = attachment
      }

      await createSocial(socialContent)
      res.status(StatusCodes.CREATED).json({success: true , msg:'Created Successfully'})
    } catch (err) {
      console.log(err);
      res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ success: false, error: err.message });
    }
  };
  const getAllSocialByArtist = async (req, res) => {
    try {
      const id = req.params.id;
  
        let SocialContent = await readAllSocialByArtist(id);
  
        res.status(StatusCodes.OK).json({ success: true, SocialContent });
    } catch (err) {
      console.log(err);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: err.message });
    }
  };
  const getSocialById = async (req, res) => {

    try {
      const id = req.params.id;
  
        let SocialContent = await readSocial(id);
  
        res.status(StatusCodes.OK).json({ success: true, SocialContent });
    } catch (err) {
      console.log(err);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: err.message });
    }
  };
  
  const deleteSocialById = async (req, res) => {

    try {
      const id = req.params.id;
  
        let SocialContent = await deleteSocial(id);
  
        res.status(StatusCodes.OK).json({ success: true, SocialContent });
    } catch (err) {
      console.log(err);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: err.message });
    }
  };
  const updateSocial = async (req, res) => {
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
        
        let filesArray = Object.values(req.files);
        let promises = [];
        
        for (let i = 0; i < filesArray.length; i++) {
          let file = filesArray[i];
          promises.push(uploadLoadFileToS3(file[0]));
        }
        
        function getFileObject(file) {
          return {
            filename: file.filename,
            fieldname: file.fieldname
          };
        }
        
        function uploadLoadFileToS3(ObjFile) {
          const fileStream = fs.createReadStream(ObjFile.path);
          let params = {
            Key: `${ObjFile.fieldname}/${ObjFile.filename}`,
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
        
        const findFile = (fieldname) => {
          return urls.find((obj) => obj.fieldname === fieldname);
        }
        
        let thumbnail;
        if (req.files?.thumbnail) {
          thumbnail = { ...getFileObject(req.files?.thumbnail[0]), url: findFile('thumbnail').url };
        } 
        
        let video;
        if (req.files?.video) {
          video = { ...getFileObject(req.files?.video[0]), url: findFile('video').url };
        } 
        
        let attachment;
        if (req.files?.attachment) {
          attachment = { ...getFileObject(req.files?.attachment[0]), url: findFile('attachment').url };
        } 
        
        // Determine contentType based on request body
        let contentType;
        if (req.body.contentType === "video" && video) {
          contentType = "video";
        } else if (req.body.contentType === "attachment" && attachment) {
          contentType = "attachment";
        } else {
          contentType = "video"; // or some default value
        }
        
        const socialContent = {
          thumbnail,
          video,
          attachment,
          ...req.body,
          contentType // Assign the determined contentType
        };
        
        await updateSocialById(id, socialContent);
        
        res.status(StatusCodes.CREATED).json({success: true , msg:'Created Successfully'});
        
    } catch (err) {
        console.log(err);
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ success: false, error: err.message });
    }
};

  module.exports = {
    create,
    getAllSocialByArtist,
    getSocialById,
    deleteSocialById,
    updateSocial
  }
  