const Nft = require("../models/Nft");

const createMintDoc = mint => {
    return Nft.create(mint);
};

const getNft = nft => {
    return Nft.findOne(nft);
};

const getNftByIds = (arrayOfIds) => {
    return Nft.find({ _id: { $in: arrayOfIds } });
};

const getAllNfts = (query, projection, options) => {
    return Nft.find(query, projection, options);
};

const updateMintDoc = (condition, object) => {
    return Nft.findOneAndUpdate(condition, { $set: object }, { new: true });
};

module.exports = {
    createMintDoc,
    updateMintDoc,
    getNft,
    getNftByIds,
    getAllNfts
};