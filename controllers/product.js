const { validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");

const {
  createProductDoc,
  allProducts,
  productById,
  delProductById,
  updProductById,
  productByArtistID,
  productByName,
  removeProductKey
} = require("../services/product");
const { allGalleries } = require('../services/gallery')
const { readArtistById } = require("../services/artist")
const { updateArtistById } = require("../services/artist")
const { transferToken } = require("../utils/nft");
const { isEqualIds } = require("../utils/dbOperation");
const User = require("../models/User");
const Product = require("../models/Product");
const Web3 = require("web3");
const abi = require("../contract/abi.json");
const _ = require('lodash')
const axios = require("axios")
const fs = require("fs");
const path = require("path");
const {
  findActiveOrder,
  allOrders,
  deleteMultipleOrders
} = require("../services/order");
const AWS = require("aws-sdk");
const { makeHistoryContent } = require("../utils/helpers");
const { createHistory } = require("../services/history");
const { contractById } = require("../services/contract");
const { galleryById } = require("../services/gallery");
const { transactionStatus, checkEthTxHash } = require("../utils/eth");
const { getDeploy } = require("../utils/cspr");

const { getNft } = require("../services/mint");
const { pinFileToIPFS } = require("../utils/web3Storage");
const { convertToKebabCase } = require("../utils/text");
const { generatePrevieweOfVideo, generatePrevieweOfMusic } = require("../utils/ffmpeg");
const { getByEmailTypeEmailTemplates, sendUserAndEmailValueNotification } = require('../services/email');
const Artist = require("../models/Artist");
const Gallery = require("../models/Gallery");
const Auction = require("../models/Auction");
const { createAuction, getAuctionById } = require("../services/auction");

const createProduct = async (req, res) => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
  });

  try {
    const errors = validationResult(req);
    const { artistId, category, } = req.body;
    const artistDetails = await readArtistById(artistId)
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, errors: errors.array() });
    }
    let filesArray = Object.values(req.files);
    let promises = [];
    for (let i = 0; i < filesArray.length; i++) {
      let file = filesArray[i];
      promises.push(uploadLoadFileToS3(file[0]));
    }
    function getFileObject(file) {
      return {
        filename: file.filename,
        fieldname: file.fieldname
      };
    }
    function uploadLoadFileToS3(ObjFile) {
      const fileStream = fs.createReadStream(ObjFile.path);
      let params = {
        Key: `${ObjFile.fieldname}/${ObjFile.filename}`,
        Body: fileStream,
        Bucket: process.env.AWS_S3_BUCKET_NAME,
      };
      if (ObjFile.mimetype === 'image/svg+xml') {
        params.ContentType = 'image/svg+xml'
      }
      return new Promise(resolve => {
        s3.upload(params, async (err, data) => {
          if (err) {
            console.log("err", err);
          }
          let ipfs;
          if (ObjFile.fieldname !== 'preview') {
            ipfs = await pinFileToIPFS(ObjFile.filename, ObjFile.path);
            return resolve({ url: data.Location, fieldname: ObjFile.fieldname, ipfsHash: ipfs });
          }

          resolve({ url: data.Location, fieldname: ObjFile.fieldname });
        });
      });
    }
    const urls = await Promise.all(promises);
    const findFile = (fieldname) => {
      return urls.find((obj) => obj.fieldname === fieldname);
    }
    let music;
    let preview;
    if (req.files?.music) {
      music = { ...getFileObject(req.files?.music[0]), url: findFile('music').url, ipfsHash: findFile('music').ipfsHash }
    }

    let thumbnail;
    if (req.files?.thumbnail) {
      thumbnail = { ...getFileObject(req.files?.thumbnail[0]), url: findFile('thumbnail').url, ipfsHash: findFile('thumbnail').ipfsHash };
    }
    let video;
    if (req.files?.video) {
      video = { ...getFileObject(req.files?.video[0]), url: findFile('video').url, ipfsHash: findFile('video').ipfsHash };
    }
    let image;
    if (req.files?.image) {
      image = { ...getFileObject(req.files?.image[0]), url: findFile('image').url, ipfsHash: findFile('image').ipfsHash };
    }
    let mask_thumbnail;
    if (req.files?.mask_thumbnail) {
      mask_thumbnail = getFileObject(req.files?.mask_thumbnail[0]);
    }

    let icon;
    if (req.files?.icon) {
      icon = { ...getFileObject(req.files?.icon[0]), url: findFile('icon').url, ipfsHash: findFile('icon').ipfsHash };
    }

    let sign;
    if (req.files?.sign) {
      sign = { ...getFileObject(req.files?.sign[0]), url: findFile('sign').url, ipfsHash: findFile('sign').ipfsHash };
    }

    let object
    if (req.files?.object) {
      object = { ...getFileObject(req.files?.object[0]), url: findFile('object').url, ipfsHash: findFile('object').ipfsHash };
    }

    const product = {
      ...req.body,
      thumbnail,
      icon
    };
    if (req.body.type !== "virtual_event") {
      const productFeaturesArray = JSON.parse(req.body.productFeatures);
      product.productFeatures = productFeaturesArray;
    }

    const uploadPreview = (file, fileStream) => {
      console.log("🚀 ~ file: product.js:147 ~ uploadPreview ~ file:", file.filename)
      return new Promise(resolve => {
        let params = {
          Key: `preview/${file.filename}`,
          Body: fileStream,
          Bucket: process.env.AWS_S3_BUCKET_NAME,
        };
        s3.upload(params, async (err, data) => {
          if (err) {
            console.log("err", err);
          }
          resolve({
            filename: file.filename,
            fieldname: file.fieldname,
            url: data.Location,
          });
        });
      });
    }

    if (req.body.type == "song") {
      product.music = music;
      product.category = JSON.parse(JSON.stringify(category));
      product.sign = sign;
      let name = music.filename.split('-')
      console.log("🚀 ~ file: product.js:173 ~ createProduct ~ name:", name)
      let audioPath = `files/${music.fieldname}/${music.filename}`
      let previewPath = `files/preview/${'preview' + name[1]}`
      await generatePrevieweOfMusic(audioPath, previewPath);
      const fileStream = fs.createReadStream(previewPath);
      const data = await uploadPreview(music, fileStream);
      product.preview = {
        filename: data.filename,
        fieldname: data.fieldname,
        url: data.url
      }
    } else if (req.body.type == "video") {
      product.category = JSON.parse(JSON.stringify(category));
      product.sign = sign;
      product.video = video
      let name = video.filename.split('-')
      let videoPath = `files/${video.fieldname}/${video.filename}`
      let previewPath = `files/video/${name[0] + '-preview' + name[1]}`
      await generatePrevieweOfVideo(videoPath, previewPath)
      const fileStream = fs.createReadStream(previewPath);
      const data = await uploadPreview(video, fileStream);
      product.preview = {
        filename: data.filename,
        fieldname: data.fieldname,
        url: data.url
      }
    } else if (req.body.type == "image") {
      product.category = JSON.parse(JSON.stringify(category));
      product.sign = sign;
      product.image = image;
    } else if (req.body.type == "product") {
      product.category = JSON.parse(JSON.stringify(category));
      product.sign = sign;
      product.video = video
      let name = video.filename.split('-')
      let videoPath = `files/${video.fieldname}/${video.filename}`
      let previewPath = `files/video/${name[0] + '-preview' + name[1]}`
      await generatePrevieweOfVideo(videoPath, previewPath)
      const fileStream = fs.createReadStream(previewPath);
      let params = {
        Key: `preview/${video.filename}`,
        Body: fileStream,
        Bucket: process.env.AWS_S3_BUCKET_NAME,
      };
      const uploadPreview = () => {
        return new Promise(resolve => {
          s3.upload(params, async (err, data) => {
            if (err) {
              console.log("err", err);
            }
            resolve({ url: data.Location, });
          });
        });
      }
      const data = await uploadPreview();
      product.preview = { url: data.url }

    } else if (req.body.type === 'object') {
      product.category = JSON.parse(JSON.stringify(category));
      product.sign = sign;
      product.object = object;
    } else if (req.body.type === "virtual_event") {
      product.category = JSON.parse(JSON.stringify(category));
      product.music = music;
      product.video = video
      let name = video.filename.split('-')
      let videoPath = `files/${video.fieldname}/${video.filename}`
      let previewPath = `files/video/${name[0] + '-preview' + name[1]}`
      await generatePrevieweOfVideo(videoPath, previewPath)
      const fileStream = fs.createReadStream(previewPath);
      let params = {
        Key: `preview/${video.filename}`,
        Body: fileStream,
        Bucket: process.env.AWS_S3_BUCKET_NAME,
      };
      const uploadPreview = () => {
        return new Promise(resolve => {
          s3.upload(params, async (err, data) => {
            if (err) {
              console.log("err", err);
            }
            resolve({ url: data.Location, });
          });
        });
      }
      const data = await uploadPreview();
      product.preview = { url: data.url }
    }
    else {
      product.mask_thumbnail = mask_thumbnail;
    }
    product.artistId = artistId;
    product.artistDetails = artistDetails;
    product.galleryId = req.body.gallery;
    const gallery = await galleryById(req.body.gallery);
    product.chain = gallery.chain;

    const newProduct = await createProductDoc(product);
    if (newProduct.isAuction) {
      const auction = {
        startingPrice: newProduct.price,
        seller: newProduct.artistId,
        product: newProduct._id,
        bids: []
      }
      const newAuction = await createAuction(auction)
      newProduct.auction = newAuction._id;
      await newProduct.save();
    }
    const type = product.type;
    const content = makeHistoryContent(
      req.user.name,
      '',
      'created',
      `a new ${type} ticket`
      , ` "${product.name}".`)
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);
    const templates = await getByEmailTypeEmailTemplates('new_product')
    if (templates) {
      await sendUserAndEmailValueNotification({ name: req.user.name, email: req.user.email }, templates);
    }
    res
      .status(StatusCodes.CREATED)
      .json({ success: true, msg: "Product created!" });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    let { query, projection, options } = req.query;
    let newQuery = {};
    if (query) {
      query = JSON.parse(query);
      Object.entries(query).map(([key, value]) => {
        if (typeof value === "string" && key !== "category" && key !== 'artistId' && key !== 'galleryId') {
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

    let products = await allProducts(newQuery, projection, options).populate("category").populate("auction");
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const artistDetails = await readArtistById(product.artistId);

      if (artistDetails) {
        const data = { ...product.artistDetails, artistURLId: artistDetails.artistURLId };
        product.artistDetails = data;
      }
    }

    let all = await allProducts(newQuery);

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

    res.status(StatusCodes.OK).json({ success: true, products, pagination });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const order = await findActiveOrder(productId);

    if (order) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, mssg: "Order is currently processing!" });
    }
    await delProductById(productId);
    res
      .status(StatusCodes.OK)
      .json({ success: true, msg: "Product deleted successfully!" });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};
const getProductById = async (req, res) => {

  try {
    const id = req.params.id;
    const product = await productById(id).populate("category");
    const auction = await getAuctionById(product.auction).populate('bids.bidder', 'name _id').exec()
    console.log('>>>', auction)
    product.auction = auction;
    if (!product) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, msg: "Not Found" });
    }

    const products = await allProducts();

    let productIndex = products.findIndex(({ id }) => id === product.id);

    if (productIndex === products.length - 1) {
      productIndex = 0;
    } else {
      productIndex += 1;
    }

    product._doc.next = {
      id: products[productIndex].id,
      name: products[productIndex].name,
      img:
        products[productIndex].icon?.filename ||
        products[productIndex].thumbnail?.filename
    };

    res.status(StatusCodes.OK).json({ success: true, product });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};
const getProductByArtistID = async (req, res) => {

  try {
    const id = req.params.id;
    const product = await productByArtistID(id).populate("category");

    if (!product) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, msg: "Not Found" });
    }

    res.status(StatusCodes.OK).json({ success: true, product });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};
const getProductByName = async (req, res) => {
  try {
    const id = req.params.name;
    const product = await productByName(id).populate("category").populate('auction')
    const auction = await getAuctionById(product.auction).populate('bids.bidder', 'avatar username name').exec()
    product.auction = auction;
    const artistDetails = await readArtistById(product.artistId)
    product.artistDetails = artistDetails

    if (!product) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, msg: "Not Found" });
    }

    const products = await allProducts();

    let productIndex = products.findIndex(({ id }) => id === product.id);

    if (productIndex === products.length - 1) {
      productIndex = 0;
    } else {
      productIndex += 1;
    }

    product._doc.next = {
      id: products[productIndex].id,
      name: products[productIndex].name,
      img:
        products[productIndex].icon?.filename ||
        products[productIndex].thumbnail?.filename
    };

    res.status(StatusCodes.OK).json({ success: true, product });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};
const deleteProductById = async (req, res) => {

  try {
    const id = req.params.id;
    const order = await findActiveOrder(id, "Created");

    if (order) {
      return res.status(StatusCodes.OK).json({
        success: false,
        msg: "Order is currently processing!",
        orderId: order._id
      });
    }
    const orders = await allOrders(
      {
        $or: [
          {
            orderItems: { $elemMatch: { productId: id } }
          }
        ]
      },
      {},
      {}
    ).select("_id");
    let ids = [];
    orders.forEach(element => {
      ids.push(element._id.toString());
    });
    const proData = await productById(id);

    await deleteMultipleOrders({ _id: { $in: ids } });

    await delProductById(id);


    const type = proData.type === 'song' ? 'song' : 'event'

    const content = makeHistoryContent(
      req.user.name,
      '',
      'deleted',
      `a ${type} ticket`
      , ` "${proData.name}".`)
    const history = {
      user: req.user,
      content: content
    };
    await createHistory(history);


    res
      .status(StatusCodes.OK)
      .json({ success: true, msg: "Product deleted successfully!" });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const updateProductById = async (req, res) => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
  });
  const { artistId, isAuction } = req.body;
  console.log("🚀 ~ file: product.js:563 ~ updateProductById ~ isAuction:", isAuction)
  const artistDetails = await readArtistById(artistId)
  try {
    const id = req.params.id;
    const productToUpdate = await productById(id)
    let filesArray = Object.values(req.files);
    let promises = [];
    for (let i = 0; i < filesArray.length; i++) {
      let file = filesArray[i];
      promises.push(uploadLoadToS3(file[0]));
    }
    function uploadLoadToS3(ObjFile) {
      const fileStream = fs.createReadStream(ObjFile.path);
      let params = {
        Key: `${ObjFile.fieldname}/${ObjFile.filename}`,
        Body: fileStream,
        Bucket: process.env.AWS_S3_BUCKET_NAME,
      };
      if (ObjFile.mimetype === 'image/svg+xml') {
        params = Object.assign({ ContentType: 'image/svg+xml' })
      }
      return new Promise(resolve => {
        s3.upload(params, async (err, data) => {
          if (err) {
            console.log("err", err);
          }
          if (ObjFile.fieldname !== 'preview') {

            ipfs = await pinFileToIPFS(ObjFile.filename, ObjFile.path);
            return resolve({ url: data.Location, fieldname: ObjFile.fieldname, ipfsHash: ipfs });
          }
          resolve({ url: data.Location, fieldname: ObjFile.fieldname });

        });
      });
    }

    function getFileObject(file) {
      return {
        filename: file.filename,
        fieldname: file.fieldname
      };
    }

    const urls = await Promise.all(promises)

    const findFile = (fieldname) => {
      return urls.find((obj) => obj.fieldname === fieldname);
    }
    let music;
    let preview;
    if (req.files?.music) {
      music = { ...getFileObject(req.files?.music[0]), url: findFile('music').url, ipfsHash: findFile('music').ipfsHash }
      preview = { ...getFileObject(req.files?.preview[0]), url: findFile('preview').url, ipfsHash: findFile('preview').ipfsHash }
    }
    let image;
    if (req.files?.image) {
      image = { ...getFileObject(req.files?.image[0]), url: findFile('image').url, ipfsHash: findFile('image').ipfsHash }
    }

    let video;
    if (req.files?.video) {
      video = { ...getFileObject(req.files?.video[0]), url: findFile('video').url, ipfsHash: findFile('video').ipfsHash }
    }


    let thumbnail;
    if (req.files?.thumbnail) {
      thumbnail = { ...getFileObject(req.files?.thumbnail[0]), url: findFile('thumbnail').url, ipfsHash: findFile('thumbnail').ipfsHash }
    } else if (req.body.thumbnail === "null") {
      thumbnail = null;
    }

    let mask_thumbnail;
    if (req.files?.mask_thumbnail) {
      mask_thumbnail = getFileObject(req.files?.mask_thumbnail[0]);
    } else if (req.body.mask_thumbnail === "null") {
      mask_thumbnail = null;
    }

    let icon;
    if (req.files?.icon) {
      icon = { ...getFileObject(req.files?.icon[0]), url: findFile('icon').url, ipfsHash: findFile('icon').ipfsHash }
    } else if (req.body.icon === "null") {
      icon = null;
    }

    let sign;
    if (req.files?.sign) {
      sign = { ...getFileObject(req.files?.sign[0]), url: findFile('sign').url, ipfsHash: findFile('sign').ipfsHash }
    } else if (req.body.sign === "null") {
      sign = null;
    }



    const product = {
      ...req.body,
      artistDetails: artistDetails,
      nftIds: productToUpdate.nftIds,
      thumbnail,
      icon
    };

    if (req.body.type !== "virtual_event") {
      const productFeaturesArray = JSON.parse(req.body.productFeatures);
      product.productFeatures = productFeaturesArray;
    }

    if (req.body.type !== "virtual_event") {
      product.music = music;
      product.preview = preview;
      product.category = JSON.parse(JSON.stringify(req.body.category));
      product.sign = sign;
      product.image = image;
      product.video = video;
      if (req.files?.video) {
        let name = video.filename.split('-')
        let videoPath = `files/${video.fieldname}/${video.filename}`
        let previewPath = `files/video/${name[0] + '-preview' + name[1]}`
        await generatePrevieweOfVideo(videoPath, previewPath)
        const fileStream = fs.createReadStream(previewPath);
        let params = {
          Key: `preview/${video.filename}`,
          Body: fileStream,
          Bucket: process.env.AWS_S3_BUCKET_NAME,
        };
        const uploadPreview = () => {
          return new Promise(resolve => {
            s3.upload(params, async (err, data) => {
              if (err) {
                console.log("err", err);
              }
              resolve({ url: data.Location, });
            });
          });
        }
        const data = await uploadPreview();
        product.preview = { url: data.url }
      }

    } else {
      product.mask_thumbnail = mask_thumbnail;
      product.image = image;
      product.video = video;
      product.music = music;
      product.preview = preview;
    }

    const updatedDoc = await updProductById(id, product);
    const auction = await getAuctionById(updatedDoc.auction)
    if (isAuction && !auction) {
      const auction = {
        startingPrice: product.price,
        seller: product.artistId,
        product: id,
        bids: []
      }
      const newAuction = await createAuction(auction);
      await updProductById(id, { isAuction, auction: newAuction._id });
    } else {
      await updProductById(id, { isAuction });
      await removeProductKey(id, "auction", "");
      auction.ended = true;
      auction.endTime = Date.now()
      await auction.save();
    }
    const type = product.type === 'virtual_event' ? 'event' : product.type

    const content = makeHistoryContent(
      req.user.name,
      '',
      'updated',
      `a ${type} ticket`
      , ` "${product.name}".`)
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

const toggleFavouriteProduct = async (req, res) => {
  try {
    const { fingerprint, productId } = req.body;
    const targetUser = await User.findById(fingerprint);
    if (targetUser) {
      const matchedIndex = targetUser.favoriteProducts.findIndex(id =>
        isEqualIds(id, productId)
      );
      if (matchedIndex === -1) targetUser.favoriteProducts.push(productId);
      else {
        targetUser.favoriteProducts.splice(matchedIndex, 1);
      }
      await targetUser.save();
      return res.status(StatusCodes.OK).json({ success: true });
    }

    res.status(StatusCodes.OK).json({ success: true });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const toggleFeaturedProduct = async (req, res) => {
  try {
    const { productId, isFeatured } = req.body;
    await updProductById(productId, { isFeatured });

    const product = await productById(productId);

    const type = product.type === 'song' ? 'song' : 'event'

    const content = makeHistoryContent(
      req.user.name,
      '',
      isFeatured ? 'featured' : 'disfeatured',
      `a ${type} ticket`
      , ` "${product.name}".`)
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

const toggleAuctionedProduct = async (req, res) => {
  try {
    const { productId, isAuction } = req.body;

    const product = await productById(productId);
    const auction = await getAuctionById(product.auction)
    if (isAuction) {
      const auction = {
        startingPrice: product.price,
        seller: product.artistId,
        product: product._id,
        bids: []
      }
      const newAuction = await createAuction(auction);
      await updProductById(productId, { isAuction, auction: newAuction._id });
    } else if (!isAuction) {
      await updProductById(productId, { isAuction });
      await removeProductKey(productId, "auction", "");
      auction.ended = true;
      auction.endTime = Date.now()
      await auction.save();
    }

    const type = product.type === 'song' ? 'song' : 'event'

    const content = makeHistoryContent(
      req.user.name,
      '',
      isAuction ? 'auctioned' : 'disauctioned',
      `a ${type} ticket`
      , ` "${product.name}".`)
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

const getTokenTransactionDetails = async (req, res) => {
  try {
    const { txHash } = req.params;
    console.log("🚀 ~ file: product.js:577 ~ getTokenTransactionDetails ~ txHash:", txHash)

    if (!txHash) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, msg: 'Invalid Params' })
    }
    const isEthHash = checkEthTxHash(txHash);
    const nft = await getNft({ 'details.transactionHash': txHash });

    if (!nft) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, msg: 'Invalid Params' })
    }
    console.log("🚀 ~ file: product.js:584 ~ getTokenTransactionDetails ~ nft:", nft)
    const contract = await contractById(nft.contractId);
    if (isEthHash && nft.details.chain == 'ETH') {
      if (!nft || !contract) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, msg: 'Invalid Params' })
      }
      const data = await transactionStatus(txHash);
      let web3;
      web3 = new Web3(process.env.ETHEREUM_TESTNET_PROVIDER);
      const myContract = new web3.eth.Contract(
        abi,
        contract.contractAddress
      );
      const events = await myContract.getPastEvents("Transfer", {
        fromBlock: 0,
        toBlock: "latest"
      });
      const tokenHistory = events.filter(
        event => event.returnValues.tokenId === nft.tokenId
      );
      return res
        .status(StatusCodes.OK)
        .json({ success: true, tx: data, history: tokenHistory, nft });
    } else {
      const transaction = await getDeploy(process.env.CSPR_NODE_ADDRESS, txHash)
      res
        .status(StatusCodes.OK)
        .json({ success: true, tx: transaction, nft });
    }



  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const transferTokenToAddress = async (req, res) => {
  try {
    const { to } = req.params;
    const { txHash } = req.body;
    const product = await Product.findOne({ txHash });
    const { data } = await transferToken(to, product.tokenId);
    product.ownerAddress = to;
    product.transferTxHash = data.txId;
    product.txHash = txHash;
    await product.save();

    res.status(StatusCodes.OK).json({ success: true, tx: data });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const getObjectDataFromResource = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ productURLId: id });
    const objectUrl = _.get(product, 'object.url')
    if (objectUrl) {
      axios.default({
        method: 'get',
        url: objectUrl,
        responseType: 'stream',
      }).then(response => {
        res.attachment(product.object.filename);
        response.data.pipe(res);
      });
    }

  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
}

const searchProducts = async (req, res) => {
  try {
    const value = req.params.value;
    const product = await Product.find({ productURLId: value })
    res.json({ success: true, exists: product.length !== 0 });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
}
const isProductPublic = async (req, res) => {
  try {
    const id = req.params.id;
    const galleries = await allGalleries({ isPublic: true })
    let galleriesId = [];
    galleries.forEach((gallery, i) => {
      galleriesId.push(gallery.id)
    })
    const allProduct = await allProducts({ galleryId: { $in: galleriesId } });
    const status = allProduct.some((item) => item.id === id);
    res.json({ success: true, isPublic: status });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
}

module.exports = {
  createProduct,
  isProductPublic,
  getAllProducts,
  getProductById,
  getProductByName,
  deleteProductById,
  updateProductById,
  toggleFavouriteProduct,
  toggleFeaturedProduct,
  getTokenTransactionDetails,
  transferTokenToAddress,
  deleteProduct,
  getProductByArtistID,
  getObjectDataFromResource,
  toggleAuctionedProduct,
  searchProducts
};
