const NewsLetterTemplates = require('../models/NewsLetterTemplate')
const SparkPost = require("sparkpost");
const {
    SPARKPOST_API_KEY,
    DEFAULT_SENDER_EMAIL_ADDRESS,
  } = require("../constants/email");
  const prettifyResponse = response => {
    return {
      id: response?.id ?? "",
      totalAcceptedRecipients: response?.total_accepted_recipients ?? null,
      totalRejectedRecipients: response?.total_rejected_recipients ?? null
    };
  };
const sendNewsLetter = async (content, recipients) => {
    const client = new SparkPost(SPARKPOST_API_KEY);
    const isProd = process.env.NODE_ENV === "production";
    const transmission = {
      content,
      recipients,
      options: {
        //eslint-disable-next-line camelcase
        // ip_pool: isProd ? 'automated' : 'default', // TODO: move this to ENV
      }
    };

  try {
    const data = await client.transmissions.send(transmission);
    return prettifyResponse(data.results);
  } catch (error) {
    console.log(error);
  }
}
const createNewsLetterTemplate = object => {
    return NewsLetterTemplates.create(object)
}

const getAllNewsLetterTemplate = (query = {}, projection = null, options = {}) => {
    return NewsLetterTemplates.find(query, projection, options)
}
const getNewsLetterByIdTemplate = (id) => {
    return NewsLetterTemplates.findById(id)
}
const updateNewLetterTemplate = (id, template) => {
    return NewsLetterTemplates.findByIdAndUpdate(id, template, {
        new: true
    })
}
const deleteNewsLetterTemplate = (id) => {
    return NewsLetterTemplates.findByIdAndDelete({_id: id})
}
const createContent = (subject, content, isHtml = false) => {
    const emailContent = {
      from: DEFAULT_SENDER_EMAIL_ADDRESS,
      subject
    };
  
    if (isHtml) {
      emailContent.html = content;
    } else {
      emailContent.text = content;
    }
  
    return emailContent;
  };
module.exports = {
    createNewsLetterTemplate,
    getAllNewsLetterTemplate,
    getNewsLetterByIdTemplate,
    updateNewLetterTemplate,
    deleteNewsLetterTemplate,
    sendNewsLetter,
    createContent
}