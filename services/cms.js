
const CMSTemplates = require("../models/cms");
const Templates = require("../models/Template");
const createCMSTemplates = object => {
  return CMSTemplates.create(object);
};
const createCMSDemoTemplates = object => {
  return Templates.create(object);
};
const getByIdCMSTemplates = (id) => {
  return CMSTemplates.findOne({ _id: id });
};
const getByTypeCMSTemplates = (type) => {
  return CMSTemplates.findOne({ template_type: type });
};
const getAllCMSTemplates = (query = {}, projection = null, options = {}) => {
  return CMSTemplates.find(query, projection, options);
};
const getAllCMSTemplatesDemo = (query = {}, projection = null, options = {}) => {
  return Templates.find(query, projection, options);
};
const updateCMSTemplatesById = (id, templates) => {
  return CMSTemplates.findByIdAndUpdate(id, templates, {
    new: true
  })
};
const deleteTemplateById = (id) => {
  return CMSTemplates.findByIdAndDelete({ _id: id });
};

module.exports = {
  createCMSTemplates,
  createCMSDemoTemplates,
  getByIdCMSTemplates,
  getByTypeCMSTemplates,
  getAllCMSTemplates,
  updateCMSTemplatesById,
  deleteTemplateById,
  getAllCMSTemplatesDemo
}