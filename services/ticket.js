const Ticket = require("../models/Ticket");

const createTicket = object => {
  return Ticket.create(object);
};

const readTicket = id => {
  return Ticket.findOne({ _id: id });
};

const getTicketDataCount = () => {
  return Ticket.countDocuments();
}
const readAllTicket = (query = {}, projection = null, options = {}) => {
  return Ticket.find(query, projection, options);
};

const deleteTicketById = id => {
  return Ticket.findByIdAndDelete({ _id: id });
};

const updateTicketById = (ticketId, ticket) => {
  return Ticket.findByIdAndUpdate(ticketId, ticket, {
    new: true
  });
};

const starredTickets = (ids) => {
  return  Ticket.updateMany({ _id: { $in: ids } }, { status: 'Starred' });
}

const archieveSelectedTickets = (ids) => {
  return  Ticket.updateMany({ _id: { $in: ids } }, { status: 'Archive' });
}

const deleteSelectedTickets = (ids) => {
  return  Ticket.deleteMany({ _id: { $in: ids } });
}

module.exports = {
  createTicket,
  readTicket,
  readAllTicket,
  deleteTicketById,
  updateTicketById,
  starredTickets,
  archieveSelectedTickets,
  deleteSelectedTickets,
  getTicketDataCount
};
