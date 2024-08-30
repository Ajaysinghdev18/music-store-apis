const { StatusCodes } = require("http-status-codes");
const Auction = require("../models/Auction");
const { updateAuctionBids, readAllAuctions, updateAuction, getAuctionById, updateAuctionBid, pushBidToAutionBids } = require("../services/auction");
const { removeProductKey, updProductById } = require("../services/product");
const { findHighestNumber, makeHistoryContent, addDaysToDate, addMinutesToDate } = require("../utils/helpers");
const { updateProductById } = require("./product");
const { getCart, createCart } = require('../services/cart');
const { createHistory } = require("../services/history");
const schedule = require('node-schedule');
const { AUCTION_PRODUCT_REMOVED_FROM_CART, AUCTION_PRODUCT_APPROVED, AUCTION_PRODUCT_DECLINED } = require("../constants/messages");
const { createMessage } = require("../services/message");


const createBidOnAuction = async (req, res) => {
  try {
    const id = req.params.id
    const { body, user } = req;
    const bid = {
      bidder: user._id,
      amount: body.amount,
      coin: body.coin
    }
    let auction = await getAuctionById(id);
    if (!auction) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: true, msg: "Invalid auction!" });
    }

    const bidToUpdate = auction.bids.find((bid) => user._id.equals(bid.bidder));
    if (bidToUpdate) {
      auction = await updateAuctionBid(id, bid.amount, bidToUpdate._id);
      if (bidToUpdate.status == 'Decline') {
        auction.bids.forEach((bid, index) => {
          if (bid._id.equals(bidToUpdate._id)) {
            auction.bids[index].status = null;
          }
        });
      }
      const numbers = auction.bids.map((bid) => bid.amount);
      auction.currentHighestBid = findHighestNumber(numbers);
      auction.latestBid = body.amount;
      await auction.save()
    } else {
      auction = await pushBidToAutionBids(id, bid);
      const numbers = auction.bids.map((bid) => bid.amount);
      auction = await updateAuction(id, { currentHighestBid: findHighestNumber(numbers), latestBid: body.amount });
    }
    res.status(StatusCodes.OK).json({ success: true, msg: "Ok", auction });
  } catch (err) {
    console.log("🚀 ~ file: balance.js ~ line 22 ~ getBalance ~ err", err);
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
        newQuery[key] = value;
      });
    }

    if (projection) {
      projection = JSON.parse(projection);
    }
    if (options) {
      options = JSON.parse(options);
    }

    let auctions = await readAllAuctions(newQuery, projection, options)
    let all = await readAllAuctions(newQuery);

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

    res.status(StatusCodes.OK).json({ success: true, auctions, pagination });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const update = async (req, res) => {
  const id = req.params.id

  try {
    await updateAuction(id, req.body);
    res.status(StatusCodes.OK).json({ success: true });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};


const finishAuction = async (req, res) => {
  try {
    const id = req.params.id;
    const { bidId, status, userId } = req.body;
    const auction = await getAuctionById(id).populate('product');
    const { product } = auction;
    if (!auction || !id) {
      return res.status(StatusCodes.OK).json({ success: false });
    }
    if (status == "Approve") {
      let winningAmount;
      auction.bids.forEach((bid, index) => {
        if (bid._id.equals(bidId))
          auction.bids[index].status = status;
        winningAmount = auction.bids[index].amount;
      });
      auction.ended = true;
      auction.buyer = userId;
      auction.endTime = Date.now();

      await auction.save();
      await removeProductKey(product._id, "auction", "")
      await updProductById(product._id, { isAuction: false })
      let cart = await getCart({ userId });
      if (!cart) {
        const cartObj = {
          products: [],
          total: winningAmount,
          userId,
          fingerprint: userId
        };
        cart = await createCart(cartObj);
      }
      const TWO_DAYS = addDaysToDate(new Date(), 2)
      cart.products.push({
        productId: product._id,
        price: winningAmount,
        currency: product.currency,
        timeToBuy: TWO_DAYS,
        isAuction: true
      });

      await createMessage({
        owner: userId,
        content: AUCTION_PRODUCT_APPROVED
      });
      const job = schedule.scheduleJob(TWO_DAYS, async function () {
        const cart = await getCart({ userId });
        const findIndex = cart.products.findIndex((p) => p.timeToBuy == TWO_DAYS.getTime())
        if (findIndex >= 0) {
          cart.products.splice(findIndex, 1)
        }
        await cart.save()
        await createMessage({
          owner: userId,
          content: AUCTION_PRODUCT_REMOVED_FROM_CART
        });

      });
      let totalCartAmount = cart.products.reduce(
        (previousValue, currentValue) => previousValue + currentValue.price,
        0
      );
      cart._doc.total = totalCartAmount;
      const content = makeHistoryContent(
        'Win',
        '',
        'bid',
        `a new auction product`
        , ` "${product.name}".`)
      const history = {
        user: userId,
        content: content
      };
      await createHistory(history);
      await cart.save();
    }
    else if (status == "Decline") {
      auction.bids.forEach((bid, index) => {
        if (bid._id.equals(bidId)) {
          auction.bids[index].status = status;
        }
      });
      await auction.save();
      await createMessage({
        owner: userId,
        content: AUCTION_PRODUCT_DECLINED
      });
    }

    res.status(StatusCodes.OK).json({ success: true });
  } catch (err) {
    console.log("🚀 ~ file: balance.js ~ line 22 ~ getBalance ~ err", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};





module.exports = { createBidOnAuction, readAll, update, finishAuction };
