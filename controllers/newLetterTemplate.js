const { StatusCodes } = require('http-status-codes');
const { validationResult } = require('express-validator');
const { createNewsLetterTemplate, createContent, getNewsLetterByIdTemplate, getAllNewsLetterTemplate,  updateNewLetterTemplate,
    deleteNewsLetterTemplate, sendNewsLetter } = require('../services/newsLetter')
const AWS = require("aws-sdk");
const fs = require("fs");

const createNewsLetter = async(req, res) => {
    try{
        const error =  validationResult(req);

        if(!error.isEmpty()){
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: error.array() })
        }

        const s3 = new AWS.S3({
            accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
        });
        const body = req.file

        const fileStream = fs.createReadStream(body.path);
        const params = {
            Key: `${body.fieldname}/${body.filename}`,
            Body: fileStream,
            Bucket: process.env.AWS_S3_BUCKET_NAME
        }
        s3.upload(params,
            async (err, data) => {
                if (err) {
                    res
                        .status(StatusCodes.INTERNAL_SERVER_ERROR)
                        .json({ success: false, error: err.message });
                    console.log(err);
                }
                if (data) {
                    req.body.thumbnail = data.Location;
                    await createNewsLetterTemplate(req.body)
                    res.status(StatusCodes.CREATED).json({
                        success: true,
                        msg: 'created newsletter Successfully'
                    });
                }
            }
        );
    }catch(e){
        res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: e.message });
    }
}

const uploadImagetoBucket = async (req, res) => {
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
        const body = req.file
        const fileStream = fs.createReadStream(body.path);
        const params = {
            Key: `${body.fieldname}/${body.filename}`,
            Body: fileStream,
            Bucket: process.env.AWS_S3_BUCKET_NAME
        }
        s3.upload(params,   async (err, data) => {
            if (err) {
                res
                    .status(StatusCodes.INTERNAL_SERVER_ERROR)
                    .json({ success: false, error: err.message });
                console.log(err);
            }
            if (data) {
                res.status(StatusCodes.CREATED).json({
                    success: true,
                    url: data.Location
                });
            }
        })
    }catch(e){
        res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: e.message });
    }
}

const getAllNewsLetter = async (req, res, next) => {
    try{
        const error =  validationResult(req);

        if(!error.isEmpty()){
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: error.array() })
        }
        const newsLetters =  await getAllNewsLetterTemplate();

        res.status(StatusCodes.OK).json({success: true, newsLetters: newsLetters})
    }catch(e) {
        res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: e.message });
    }
}
const getNewsLetterByID = async (req, res) => {
    try{
        const error =  validationResult(req);

        if(!error.isEmpty()){
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: error.array() })
        }
        const newsLetter =  await getNewsLetterByIdTemplate(req.params.id);

        res.status(StatusCodes.OK).json({success: true, newsLetter: newsLetter})
    }catch(e) {
        res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: e.message });
    }
}
const deleteNewsLetter = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ success: false, errors: errors.array() });
        }
        await deleteNewsLetterTemplate(req.params.id)
        res.status(200).json({ success: true, msg: 'Deleted Template Successfully' });
    } catch (e) {
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ success: false, error: e.message });
    }
}

const updateNewLeter = async (req, res) => {
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
        const body = req.file
        if (body === undefined) {
            await updateNewLetterTemplate(req.params.id, req.body)
            res.status(StatusCodes.CREATED).json({
                success: true,
                msg: 'updated template Successfully'
            });
        }
        else {
            // return
            const fileStream = fs.createReadStream(body.path);
            const params = {
                Key: `${body.fieldname}/${body.filename}`,
                Body: fileStream,
                Bucket: process.env.AWS_S3_BUCKET_NAME
            }
            s3.upload(params,
                async (err, data) => {
                    if (err) {
                        res
                            .status(StatusCodes.INTERNAL_SERVER_ERROR)
                            .json({ success: false, error: err.message });
                        console.log(err);
                    }
                    if (data) {
                        req.body.thumbnail = data.Location;
                        await updateEmailTemplatesById(req.params.id, req.body)
                        res.status(StatusCodes.CREATED).json({
                            success: true,
                            msg: 'updated templated Successfully'
                        });
                    }
                }
            );
        }


    } catch (e) {
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ success: false, error: e.message });
    }
}
const sendNewsLetterToUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ success: false, errors: errors.array() });
        }
        const emailContent = createContent(
            req.body.subject,
            req.body.content,
            true
        );
        await sendNewsLetter(emailContent, req.body.address)
        res
            .status(StatusCodes.CREATED)
            .json({ success: true, msg: "Send Email to given address" });
    }
    catch (e) {
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ success: false, error: e.message });
    }
}
module.exports = {
    createNewsLetter,
    getNewsLetterByID,
    getAllNewsLetter,
    uploadImagetoBucket,
    updateNewLeter,
    deleteNewsLetter,
    sendNewsLetterToUser
}