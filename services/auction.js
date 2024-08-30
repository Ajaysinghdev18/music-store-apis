const Auction = require("../models/Auction");

const createAuction = auction => {
  return Auction.create(auction);
};

const updateAuction = (auctionId, data) => {
  return Auction.findByIdAndUpdate(auctionId, data, {
    new: true
  });
};

const getAuctionById = id => {
  return Auction.findOne({ _id: id });
};


const updateAuctionBid = (auctionId, amount, bidId) => {
  return Auction.findOneAndUpdate({ _id: auctionId, 'bids._id': bidId }, {
    $set: {
      'bids.$.amount': amount
    }
  }, {
    new: true
  })
};


const pushBidToAutionBids = (auctionId, bid) => {
  return Auction.findByIdAndUpdate(auctionId, { $addToSet: { bids: bid } }, {
    new: true
  });
};

const removeKeyValue = (auctionId, field, value) => {
  return Auction.findByIdAndUpdate(auctionId, { $unset: { field: value } }, {
    new: true
  });
};

const readAllAuctions = (query = {}, projection = null, options = {}) => {
  return Auction.find(query, projection, options);
};


module.exports = {
  createAuction,
  getAuctionById,
  updateAuction,
  pushBidToAutionBids,
  updateAuctionBid,
  readAllAuctions,
  removeKeyValue
};
