const Artist = require("../models/Artist");
const User = require("../models/User");
const createArtist = object => {
    return Artist.create(object);
};

const readArtistById = id => {
    return Artist.findOne({ _id: id });
};
const readArtistVerifyById = id => {
    return User.findOne({ _id: id });
};

const readAllArtist = (query = {}, projection = null, options = {}) => {
    return Artist.find(query, projection, options);
};
const artistByName = name => {
    return Artist.findOne({ artistURLId: name });
  };
  

const deleteArtistById = id => {
    return Artist.findByIdAndDelete({ _id: id });
};

const updateArtistById = (id, data) => {
    return Artist.findByIdAndUpdate(id, data, {
        new: true
    });
};

const aggregateArtists = pipeline => {
    return Artist.aggregate(pipeline);
};

module.exports = {
    createArtist,
    readAllArtist,
    readArtistById,
    deleteArtistById,
    updateArtistById,
    aggregateArtists,
    readArtistVerifyById,
    artistByName
};
