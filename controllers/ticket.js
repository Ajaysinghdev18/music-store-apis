const { validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const { makeHistoryContent } = require('../utils/helpers');

const {
  createTicket,
  readTicket,
  readAllTicket,
  deleteTicketById,
  updateTicketById,
  starredTickets,
  archieveSelectedTickets,
  deleteSelectedTickets,
  getTicketDataCount
} = require("../services/ticket");
const {createHistory} = require("../services/history");

const create = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ success: false, errors: errors.array() });
    }

    let files = req.files;
    const ticketCount = await getTicketDataCount();
    const request_id = `TICKET-${req.body.userId.slice(-7)}-${ticketCount+1}`

    const ticket = {
      ...req.body,
      _id: request_id,
      files,
      answer:""
    };

    await createTicket(ticket);

    res
        .status(StatusCodes.CREATED)
        .json({ success: true, msg: "Ticket created!" });
  } catch (err) {
    console.log(err);
    res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: err.message });
  }
};

const readAll = async (req, res) => {
  try {
    let { query, projection, options } = req.query;

    let newQuery = {};
    if (query) {
      query = JSON.parse(query);
      Object.entries(query).map(([key, value]) => {
        if (typeof value === "string") {
          newQuery[key] = new RegExp(`${value}`, "i");
        } else {
          newQuery[key] = value;
        }
      });
    }
    if (projection) {
      projection = JSON.parse(projection);
    }
    if (options) {
      options = JSON.parse(options);
    }

    let tickets = await readAllTicket(newQuery, projection, options);
    console.log("tickets>>>>>", tickets)
    let all = await readAllTicket(newQuery);
    console.log("all>>>>", all)

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

    res.status(StatusCodes.OK).json({ success: true, tickets, pagination });
  } catch (err) {
    console.log(err);
    res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: err.message });
  }
};

const read = async (req, res) => {
  try {
    const id = req.params.id;
    const ticket = await readTicket(id);

    if (!ticket) {
      return res
          .status(StatusCodes.NOT_FOUND)
          .json({ success: false, msg: "Not Found" });
    }

    res.status(StatusCodes.OK).json({ success: true, ticket });
  } catch (err) {
    console.log(err);
    res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const id = req.params.id;

    const ticket = await readTicket(id);

    await deleteTicketById(id);

    const content = makeHistoryContent(
        req.user.name,
        '',
        'deleted',
        `a ${ticket.name}'s ticket`,` "${ticket.subject}".`)
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);
    res
        .status(StatusCodes.OK)
        .json({ success: true, msg: "Ticket deleted successfully!" });
  } catch (err) {
    console.log(err);
    res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const id = req.params.id;

    let files;
    if (req.files) {
      files = req.files;
    }

    const updates = {
      ...req.body,
      files
    };


    await updateTicketById(id, updates);

    const ticket = await readTicket(id);

    let action;
    if( ticket.status === 'Archive' )
      action = 'archived'
    else if( ticket.status === 'Processing')
      action = 'published'
    else if( ticket.status === 'Starred' )
      action = 'favorited'
    else
      action = 'checked'


    const content = makeHistoryContent(
        req.user.name,
        '',
        action,
        `a ${ticket.name}'s ticket`,` "${ticket.subject}".`)
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);


    res.status(StatusCodes.OK).json({ success: true, ticket: ticket });
  } catch (err) {
    console.log(err);
    res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: err.message });
  }
};

const favoriteTickets = async (req, res) => {
  try {
    console.log('##########ids############',req.user);
    await starredTickets(req.body.ids);

    const  action = 'favorited'

    const content = makeHistoryContent(
      req.user.name,
      '',
      action,
      'some tickets')
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);


    res.status(StatusCodes.OK).json({ success: true });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const archieveTickets = async (req, res) => {
  try {
    console.log('##########ids############',req.body.ids);
    await archieveSelectedTickets(req.body.ids);

    const  action = 'archived'

    const content = makeHistoryContent(
      req.user.name,
      '',
      action,
      'some tickets')
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);


    res.status(StatusCodes.OK).json({ success: true });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const deleteTickets = async (req, res) => {
  try {
    await deleteSelectedTickets(req.body.ids);

    const  action = 'deleted'

    const content = makeHistoryContent(
      req.user.name,
      '',
      action,
      'some tickets')
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);


    res.status(StatusCodes.OK).json({ success: true });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};
module.exports = {
  create,
  read,
  readAll,
  remove,
  update,
  favoriteTickets,
  archieveTickets,
  deleteTickets
};

