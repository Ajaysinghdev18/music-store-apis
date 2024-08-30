
const { StatusCodes } = require("http-status-codes");
const { validationResult } = require("express-validator");
const { 
    createCMSTemplates,
    getByIdCMSTemplates,
    getAllCMSTemplates,
    updateCMSTemplatesById,
    deleteTemplateById,
    createCMSDemoTemplates,
    getAllCMSTemplatesDemo
} = require("../services/cms")
const AWS = require("aws-sdk");
const fs = require("fs");


const createTemplate = async (req, res) => {
    try {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ success: false, errors: errors.array() });
        }
        await createCMSTemplates(req.body)
        res.status(StatusCodes.CREATED).json({
            success: true,
            msg: 'created templated Successfully'
        });
    
    } catch (e) {
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ success: false, error: e.message });
    }
}
const createDemoTemplate = async (req, res) => {
    try {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ success: false, errors: errors.array() });
        }
        await createCMSDemoTemplates(req.body)
        res.status(StatusCodes.CREATED).json({
            success: true,
            msg: 'created templated Successfully'
        });
    
    } catch (e) {
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ success: false, error: e.message });
    }
}

const getCMSTemplateById = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ success: false, errors: errors.array() });
        }
        const templates = await getByIdCMSTemplates(req.params.id)

        res.status(200).json({ success: true, templates });
    } catch (e) {
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ success: false, error: e.message });
    }
}
const getAllCMSTemplate = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ success: false, errors: errors.array() });
        }
        const templates = await getAllCMSTemplates()

        res.status(200).json({ success: true, templates });
    } catch (e) {
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ success: false, error: e.message });
    }
}
const getAllTemplate = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ success: false, errors: errors.array() });
        }
        const templates = await getAllCMSTemplatesDemo()

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
        await updateCMSTemplatesById(req.params.id, req.body)
        res.status(StatusCodes.CREATED).json({
            success: true,
            msg: 'updated templated Successfully'
        });

    } catch (e) {
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ success: false, error: e.message });
    }
}

module.exports =  {
    createTemplate,
    getCMSTemplateById,
    getAllCMSTemplate,
    deleteTemplate,
    updateTemplate,
    getAllTemplate,
    createDemoTemplate
}