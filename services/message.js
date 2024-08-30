const Message = require("../models/Message");

const createMessage = async message => {
  return Message.create(message);
};

const readMessages = async (query, projection, options) => {
  return Message.find(query, projection, options);
};
const updateMessagesByID = async (id, messageData) => {
  return Message.findByIdAndUpdate(id, messageData);
};
const removeMessageById = async id => {
  return Message.findByIdAndDelete({ _id: id });
};

module.exports = {
  createMessage,
  readMessages,
  removeMessageById,
  updateMessagesByID
};
