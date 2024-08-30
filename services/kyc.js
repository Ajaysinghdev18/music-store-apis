const KYC = require("../models/Kyc");
const User = require("../models/User");
const createKYC = object => {
    return KYC.create(object);
};
const allKYC = (query = {}, projection = null, options = {}) => {
    return KYC.find(query, projection, options);
};
const getKYCDetailsById = (id) => {
    return KYC.findOne({ _id: id });
};
const getKYCDataCount = (id) => {
    return KYC.countDocuments();
};
const updKYCById = (KYCId, KYCData) => {
    return KYC.findByIdAndUpdate(KYCId, KYCData, {
        new: true
    });
};
const updUserKYCById = (id, data) => {
    return User.findByIdAndUpdate(id, data, {
        new: true
    });
};

module.exports = {
    createKYC,
    allKYC,
    getKYCDetailsById,
    updKYCById,
    updUserKYCById,
    getKYCDataCount
}