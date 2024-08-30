const SparkPost = require("sparkpost");
const fs = require("fs");
const {
  SPARKPOST_API_KEY,
  SPARKPOST_ENDPOINT,
  WEB_APP_URL,
  DEFAULT_SENDER_EMAIL_ADDRESS,
  EMAIL_TEMPLATE_TABLE
} = require("../constants/email");
const {
  FORGOT_PASSWORD_EMAIL_TEMPLATE,
  CREATE_ACCOUNT_HAS_TOKEN_TEMPLATE,
} = require("../templates/email");
const moment = require("moment");
const EmailTemplates = require("../models/email");
const EasyEmailTemplates = require('../models/easyemail')
const isEasyTemplate = EMAIL_TEMPLATE_TABLE === 'easyemail';

const client = new SparkPost(SPARKPOST_API_KEY, {
  endpoint: SPARKPOST_ENDPOINT
});

const prettifyResponse = response => {
  return {
    id: response?.id ?? "",
    totalAcceptedRecipients: response?.total_accepted_recipients ?? null,
    totalRejectedRecipients: response?.total_rejected_recipients ?? null
  };
};
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

const sendEmail = async (content, recipients) => {
  const client = new SparkPost(process.env.SPARKPOST_API_KEY);
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
};

const sendForgotPasswordEmail = async (user, token) => {
  const emailContent = createContent(
    FORGOT_PASSWORD_EMAIL_TEMPLATE.subject,
    FORGOT_PASSWORD_EMAIL_TEMPLATE.content.replace(
      "{:resetPasswordUrl}",
      `${WEB_APP_URL}/reset-password?token=${token}`
    ),
    true
  );
  await sendEmail(emailContent, [{ address: user.email }]);
};
const sendNewAccountHasTokenEmail = async (user, token) => {
  const emailContent = createContent(
    CREATE_ACCOUNT_HAS_TOKEN_TEMPLATE.subject,
    CREATE_ACCOUNT_HAS_TOKEN_TEMPLATE.content
      .replace("{:verify}", `${WEB_APP_URL}/verify?token=${token}`)
      .replace("Hello Jane Doe!", `Hello ${user.name}!`)
      .replace("EmailAddress", `${user.email}`),
    true
  );
  await sendEmail(emailContent, [{ address: user.email }]);
};

const sendOrderEmailNotification = async (user, order, template) => {
  const emailContent = createContent(
    template.subject,
    template.contentHtml
      .replace("Name", `${user.name}`)
      .replace(
        "OrderDate",
        `${moment(order.createdAt).format("DD MMM YYYY")}\n\n${moment(
          order.createdAt
        ).format("hh:mm:ss (Z)")}`
      )
      .replace('VAT', order.vat)
      .replace(
        "Delivery",
        `${moment(order.updatedAt).format("DD MMM YYYY")}\n\n${moment(
          order.updatedAt
        ).format("hh:mm:ss (Z)")}`
      )
      .replace("SubTotal", `${order.totalPrice}`)
      .replace("OrderTotal", `${order.totalPrice}`)
      .replace("Total", `${order.totalPrice}`),
    true
  );
  await sendEmail(emailContent, [{ address: user.email }]);
};

const sendUserAndEmailValueNotification = async (user, template) => {
  const emailContent = createContent(
    template.subject,
    template.contentHtml.replace('{{userName}}', user.name)
    .replace("{{emailAddress}}",`${user.email}` ),
    true
  );
  await sendEmail(emailContent, [{ address: user.email }]);
};
const sendNewTokenEmail = async (user, token, template)  => {
  const emailContent = createContent(
    template.subject,
    template.contentHtml
      .replace(':verify', `${WEB_APP_URL}/verify?token=${token}`)
      .replace('{{userName}}', `${user.name}`)
      .replace('{{emailAddress}}', `${user.email}`),
    true
  );
  await sendEmail(emailContent, [{ address: user.email }]);
};
const sendKYCRejectedNotification = async (user, template) => {
  const emailContent = createContent(
    template.subject,
    template.contentHtml.replace('{{userName}}', user.name)
    .replace("{{emailAddress}}",`${user.email}` )
    .replace("{{adminComment}}", `${user.reason}`),
    true
  );
  await sendEmail(emailContent, [{ address: user.email }]);
};

const createEmailTemplates = object => {  
  return isEasyTemplate ? EasyEmailTemplates.create(object) : EmailTemplates.create(object);
};
const getByIdEmailTemplates = (id) => {
  return isEasyTemplate ? EasyEmailTemplates.findOne({ _id: id }) : EmailTemplates.findOne({ _id: id });
};
const getByEmailTypeEmailTemplates = (email_type) => {
  return isEasyTemplate ? EasyEmailTemplates.findOne({ email_type: email_type }) : EmailTemplates.findOne({ email_type: email_type });
};
const getAllEmailTemplates = (query = {}, projection = null, options = {}) => {
  return isEasyTemplate ? EasyEmailTemplates.find(query, projection, options) : EmailTemplates.find(query, projection, options);
};
const updateEmailTemplatesById = (id, templates) => {
  return isEasyTemplate ?  EasyEmailTemplates.findByIdAndUpdate(id, templates, {
    new: true
  }): EmailTemplates.findByIdAndUpdate(id, templates, {
    new: true
  });
};
const deleteTemplateById = (id) => {
  return isEasyTemplate ? EasyEmailTemplates.findByIdAndDelete({ _id: id }) : EmailTemplates.findByIdAndDelete({ _id: id });
};
module.exports = {
  sendForgotPasswordEmail,
  sendOrderEmailNotification,
  sendNewAccountHasTokenEmail,
  sendEmail,
  createContent,
  createEmailTemplates,
  getByIdEmailTemplates,
  getAllEmailTemplates,
  updateEmailTemplatesById,
  deleteTemplateById,
  getByEmailTypeEmailTemplates,
  sendUserAndEmailValueNotification,
  sendKYCRejectedNotification,
  sendNewTokenEmail
};
