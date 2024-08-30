const { StatusCodes } = require("http-status-codes");
const { validationResult } = require("express-validator");
const AWS = require("aws-sdk");
const fs = require("fs");

const {
  createGalleryDoc,
  aggregateGalleries,
  allGalleries,
  galleryById,
  galleryByName,
  updGalleryById,
  allNftsByContractId,
  deleteGalleryById
} = require("../services/gallery");
const { mintEthNft } = require("../utils/eth");
const { contractById } = require("../services/contract");
const {readArtistById} = require('../services/artist')
const { mintCsprNft } = require("../utils/cspr");
const { createMintDoc } = require("../services/mint");
const { getByEmailTypeEmailTemplates, sendUserAndEmailValueNotification } = require('../services/email')
const User = require('../models/User');
const Gallery = require("../models/Gallery");
const { readUser } = require("../services/user");
const { default: mongoose } = require("mongoose");

const createGallery = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, errors: errors.array() });
    }
    const { contractId, chain, artistId } = req.body;
    const contract = await contractById(contractId);

    if (!contract || contract.details.chain !== chain) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, msg: 'Contract dont match with chain' });
    }

    if (!mongoose.Types.ObjectId.isValid(contractId)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, msg: 'Invalid Contract Id!' });
    }

    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
    });
    const body = req.file

    // return
    const fileStream = fs.createReadStream(body.path);
    const params = {
      Key: `${body.fieldname}/${body.filename}`,
      Body: fileStream,
      Bucket: process.env.AWS_S3_BUCKET_NAME
    }
    s3.upload(params,
      async (err, data) => {
        if (err) {
          res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ success: false, error: err.message });
          console.log(err);
        }
        if (data) {
          req.body.thumbnail = data.Location;
          await createGalleryDoc(req.body);

          res.status(StatusCodes.CREATED).json({
            success: true,
            msg: "Gallery created!"
          });
        }
      }
    );
    const user = await readArtistById(artistId);
    const template = await getByEmailTypeEmailTemplates('new_gallery')
    if (template && user) {
      await sendUserAndEmailValueNotification({ name: user.name, email: user.email }, template);
    }
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const getAllNftsByGalleryId = async (req, res) => {
  try {
    let { query, projection, options, aggregate } = req.query;
    const id = req.params.id;

    const gallery = await galleryById(id);

    if (!gallery) {
      res.status(StatusCodes.OK).json({ success: false });
    }

    if (aggregate) {
      aggregate = JSON.parse(aggregate);
      let galleries = await aggregateGalleries(aggregate);
      res.status(StatusCodes.OK).json({ success: true, galleries });
    } else {
      let newQuery = { contractId: gallery.contractId };
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

      let nfts = await allNftsByContractId(newQuery, projection, options);
      const allNfts = await allNftsByContractId(newQuery);

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
        total: allNfts.length,
        pageLimit,
        pageNumber
      };


      res.status(StatusCodes.OK).json({ success: true, nfts, pagination });
    }
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};


const getAllGalleriesByArtist = async (req, res) => {
  try {
    let { query, projection, options, aggregate } = req.query;
    const id = req.params.id;

    if (aggregate) {
      aggregate = JSON.parse(aggregate);

      let galleries = await aggregateGalleries(aggregate);
      res.status(StatusCodes.OK).json({ success: true, galleries });
    } else {
      let newQuery = { artistId: id };

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

      let galleries = await allGalleries(newQuery, projection, options);
      const all = await allGalleries(newQuery);

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

      res.status(StatusCodes.OK).json({ success: true, galleries, pagination });
    }
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};
const all = async (req, res) => {
  try {
    let { query, projection, options, aggregate } = req.query;

    if (aggregate) {
      aggregate = JSON.parse(aggregate);

      let galleries = await allGalleries(aggregate)
      res.status(StatusCodes.OK).json({ success: true, galleries });
    } else {
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

      let galleries = await allGalleries(newQuery, projection, options).populate('artistId');
      const all = await allGalleries(newQuery);

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

      res.status(StatusCodes.OK).json({ success: true, galleries, pagination });
    }
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const getGalleryById = async (req, res) => {
  try {
    const id = req.params.id;
    const gallery = await galleryById(id);

    if (!gallery) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, msg: "Not Found" });
    }

    res.status(StatusCodes.OK).json({ success: true, gallery });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const getGalleryByName = async (req, res) => {
  try {
    const name = req.params.name;
    const gallery = await galleryByName(name)

    if (!gallery) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, msg: "Not Found" });
    }

    res.status(StatusCodes.OK).json({ success: true, gallery });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const addIpfs = async (req, res) => {
  try {
    const id = req.params.id;
    let gallery = await galleryById(id);

    const ipfs = req.body.details;
    gallery.ipfsEntries = [...gallery.ipfsEntries, ipfs];

    gallery = await updGalleryById(id, gallery);
    res.status(StatusCodes.OK).json({ success: true, gallery });
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
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
    });

    let gallery;
    if (typeof req.body.thumbnail !== 'string') {
      const body = req.file
      const fileStream = fs.createReadStream(body.path);
      const params = {
        Key: `${body.fieldname}/${body.filename}`,
        Body: fileStream,
        Bucket: process.env.AWS_S3_BUCKET_NAME
      }
      const uploadInageTos3 = async () => {
        return new Promise((resolve, rej) => {
          s3.upload(params,
            async (err, data) => {
              if (err) {
                return res
                  .status(StatusCodes.INTERNAL_SERVER_ERROR)
                  .json({ success: false, error: err.message });
              }
              gallery = {
                ...req.body,
                thumbnail: data.Location,
              };
              resolve(data.Location)
            }

          );
        })
      }
      await uploadInageTos3();
      await updGalleryById({ _id: id }, gallery);
      return res.status(StatusCodes.OK).json({ success: true });
    } else {
      await updGalleryById({ _id: id }, req.body);
      res.status(StatusCodes.OK).json({ success: true });
    }
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};
const mintNftInGallery = async (req, res) => {


  try {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
    });


    const body = req.file
    const fileStream = fs.createReadStream(body.path);
    const params = {
      Key: `${body.fieldname}/${body.filename}`,
      Body: fileStream,
      Bucket: process.env.AWS_S3_BUCKET_NAME
    }
    const uploadInageTos3 = async () => {
      return new Promise((resolve, rej) => {
        s3.upload(params,
          async (err, data) => {
            if (err) {
              return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ success: false, error: err.message });
            }
            gallery = {
              ...req.body,
              thumbnail: data.Location,
            };
            resolve(data.Location)
          }

        );
      })
    }
    const url = await uploadInageTos3();
    req.body.uri = url;
    const { contractId, uri, network, chain } = req.body;
    const contract = await contractById(contractId);
    const mint = {
      contractId,
      uri,
      details: {
        network,
        to: '',
        chain,
        transactionHash: '',
      },
      tokenId: '',
      status: false
    }
    if (!contract) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, msg: 'Invalid Contract' })
    }
    if (network == "testnet" && chain == "ETH") {
      const result = await mintEthNft(contract.contractAddress, process.env.ETHEREUM_PUBLIC_KEY_FOR_TRANSACTIONS, uri);
      mint.tokenId = result.tokenId;
      mint.details.transactionHash = result.transactionHash;
      mint.details.to = process.env.ETHEREUM_PUBLIC_KEY_FOR_TRANSACTIONS;
      mint.status = result.status
    }
    else if (network == "testnet" && chain == "CSPR") {
      const result = await mintCsprNft(contractId, contract.contractHash, uri)
      mint.tokenId = result.tokenId;
      mint.details.transactionHash = result.transactionHash;
      mint.details.to = process.env.CASPER_PUBLIC_KEY;
    }
    await createMintDoc(mint);
    res.status(StatusCodes.OK).json({
      success: true,
      transaction: mint
    });
    // await updGalleryById({ _id: id }, gallery);
    // return res.status(StatusCodes.OK).json({ success: true });

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
    const gallery = await galleryById(id);
    if (!gallery) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, msg: 'Gallery Not Found' });
    }
    await deleteGalleryById(id)
    res
      .status(StatusCodes.OK)
      .json({ success: true, msg: 'Gallery deleted sucessfully' });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const searchGallery = async (req, res) => {
  try {
    const value = req.params.value;
    const artist = await Gallery.find({ galleryURLId: value })
    res.json({ success: true, exists: artist.length !== 0 });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
}

module.exports = {
  createGallery,
  getAllGalleriesByArtist,
  getGalleryById,
  getGalleryByName,
  addIpfs,
  getAllNftsByGalleryId,
  update,
  mintNftInGallery,
  all,
  remove,
  searchGallery
};
