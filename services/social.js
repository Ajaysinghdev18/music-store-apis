const Social =  require("../models/Social");

const createSocial = object => {
    return Social.create(object);
};
const readSocial = id => {
    return Social.findOne({ _id: id });
};

const readAllSocialByArtist = (id) => {
    return Social.find({artistId:id});
  };

const readAllSocial = (query = {}, projection = null, options = {}) => {
    return Social.find(query, projection, options);
  };

const deleteSocial = id => {
    return Social.findByIdAndDelete({_id: id})
}

const updateSocialById = (id, content) => {
    return Social.findByIdAndUpdate(id, content, {
        new: true
      }); 
}

module.exports = {
    createSocial,
    updateSocialById,
    deleteSocial,
    readAllSocial,
    readAllSocialByArtist,
    readSocial
}