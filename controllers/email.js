const { StatusCodes } = require("http-status-codes");
const { validationResult } = require("express-validator");
const { sendEmail, createContent, getAllEmailTemplates, getByIdEmailTemplates, deleteTemplateById, updateEmailTemplatesById, createEmailTemplates } = require("../services/email");
const AWS = require("aws-sdk");
const fs = require("fs");

const sendEmailToUser = async (req, res, next) => {
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
        await sendEmail(emailContent, req.body.address)
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

const createTemplate = async (req, res) => {
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
                    await createEmailTemplates(req.body)
                    res.status(StatusCodes.CREATED).json({
                        success: true,
                        msg: 'created templated Successfully'
                    });
                }
            }
        );
    } catch (e) {
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ success: false, error: e.message });
    }
}

const getAllEmailTemplateById = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ success: false, errors: errors.array() });
        }
        const templates = await getByIdEmailTemplates(req.params.id)

        res.status(200).json({ success: true, templates });
    } catch (e) {
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ success: false, error: e.message });
    }
}
const getAllEmailTemplate = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ success: false, errors: errors.array() });
        }
        const templates = await getAllEmailTemplates()

        res.status(200).json({ success: true, templates });
    } catch (e) {
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ success: false, error: e.message });
    }
}
const deleteTemplate = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ success: false, errors: errors.array() });
        }
        await deleteTemplateById(req.params.id)
        res.status(200).json({ success: true, msg: 'Deleted Template Successfully' });
    } catch (e) {
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ success: false, error: e.message });
    }
}

const updateTemplate = async (req, res) => {
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
            await updateEmailTemplatesById(req.params.id, req.body)
            res.status(StatusCodes.CREATED).json({
                success: true,
                msg: 'updated templated Successfully'
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
module.exports = {
    sendEmailToUser,
    createTemplate,
    getAllEmailTemplate,
    getAllEmailTemplateById,
    deleteTemplate,
    updateTemplate,
    uploadImagetoBucket
}