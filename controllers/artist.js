const { validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const { sendUserAndEmailValueNotification, getByEmailTypeEmailTemplates } = require("../services/email");
const {
    createArtist,
    readArtistById,
    readAllArtist,
    updateArtistById,
    deleteArtistById,
    artistByName
} = require("../services/artist");
const AWS = require("aws-sdk");
const fs = require("fs");
const { createUser, readUser, updateUser, removeUser } = require("../services/user");
const bcrypt = require("bcrypt");
const { generatePasswordHash } = require("../services/auth");
const { createCasperWallet } = require("../utils/cspr");
const { createEthWallet } = require("../utils/eth");
const { readAllWallets } = require("../services/wallet");
const { getAllNfts } = require("../services/mint");
const { allProducts } = require("../services/product");
const Artist = require("../models/Artist");

const create = async (req, res) => {
    try {
        const { email, name } = req.body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ success: false, errors: errors.array() });
        }
        const isUserExists = await readUser({ $or: [{ email: email.toLowerCase(), }, { name: name.replaceAll(' ', '_') }] });
        if (isUserExists) {
            return res
                .status(StatusCodes.CONFLICT)
                .json({ success: false, msg: 'This User already exists' });
        }
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
        const artist = {
            ...req.body,
            thumbnail: data.url,
        };
        const newArtist = await createArtist(artist);
        const user = await createUser({
            ...req.body,
            username: name.replaceAll(' ', '_'),
            email: email.toLowerCase(),
            verify: false,
            role: 'artist',
            artistId: newArtist._id
        });
        await createCasperWallet(user._id);
        await createEthWallet(user._id);
        const template = await getByEmailTypeEmailTemplates('artist_welcome')
        await sendUserAndEmailValueNotification({ name: name, email: email }, template)
        res.status(StatusCodes.CREATED).json({ success: true, msg: "Artist created!" });
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
        const artist = await readArtistById(id);
        const user = await readUser({ artistId: artist.id });
        if (!artist) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ success: false, msg: 'Artist Not Found' });
        }
        if (user) {
            await removeUser(user._id)
        }
        await deleteArtistById(id)
        res
            .status(StatusCodes.OK)
            .json({ success: true, msg: 'Artist deleted sucessfully' });
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

        let artists = await readAllArtist(newQuery, projection, options).populate('user');
        let all = await readAllArtist(newQuery);

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

        res.status(StatusCodes.OK).json({ success: true, artists, pagination });
    } catch (err) {
        console.log(err);
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ success: false, error: err.message });
    }
};

const readbyName = async (req, res) => {
    try {
        const id = req.params.name;
        const artist = await artistByName(id).populate({
            path: "subscriber",
        });

        if (!artist) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ success: false, msg: "Not Found" });
        }
        const artistProducts = await allProducts({ artistId: artist.id });
        const artistNfts = await getAllNfts({ artistId: artist.id });
        const sellNfts = artistNfts.reduce((accumulator, nft) => {
            if (nft.isMinted) {
                return accumulator + 1;
            } else {
                return accumulator + 0;
            }
        }, 0)
        artist.nftsCount = artistProducts.length;
        artist.sellNfts = sellNfts;
        res.status(StatusCodes.OK).json({ success: true, artist });
    } catch (err) {
        console.log(err);
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ success: false, error: err.message });
    }
};

const searchArtist = async (req, res) => {
    try {
        const value = req.params.value;
        const artist = await Artist.find({ artistURLId: value })
        res.json({ success: true, exists: artist.length !== 0 });
    } catch (err) {
        console.log(err);
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ success: false, error: err.message });
    }
}

const read = async (req, res) => {
    try {
        const id = req.params.id;
        const artist = await readArtistById(id).populate({
            path: "subscriber",
        });

        if (!artist) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ success: false, msg: "Not Found" });
        }
        const artistProducts = await allProducts({ artistId: id });
        const artistNfts = await getAllNfts({ artistId: id });
        const sellNfts = artistNfts.reduce((accumulator, nft) => {
            if (nft.isMinted) {
                return accumulator + 1;
            } else {
                return accumulator + 0;
            }
        }, 0)
        artist.nftsCount = artistProducts.length;
        artist.sellNfts = sellNfts;
        res.status(StatusCodes.OK).json({ success: true, artist });
    } catch (err) {
        console.log(err);
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ success: false, error: err.message });
    }
};


const update = async (req, res) => {
    const id = req.params.id;
    const { email, password, deploymentExecution } = req.body;
    const artistData = await readArtistById(id)
    try {
        const s3 = new AWS.S3({
            accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
        });
        const user = await readUser({ artistId: id })
        if (user) {
            const wallets = await readAllWallets({ userId: user._id });
            if (deploymentExecution == 'custom') {
                if (wallets.length == 0) {
                    await createCasperWallet(user._id);
                    await createEthWallet(user._id);
                }
            }
        }
        if (password) {
            if (!user) {
                await createUser({
                    ...req.body,
                    username: req.body.name.replaceAll(' ', '_'),
                    subscribedArtist: [],
                    email: req.body.email.toLowerCase(),
                    verify: false,
                    role: 'artist',
                    artistId: id
                });
            } else {
                const salt = await bcrypt.genSalt(10);
                let newPassword = await generatePasswordHash(password, salt);
                await updateUser(user._id, { password: newPassword })
            }
        }
        if (req.file) {
            const body = req.file
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

                    const artist = {
                        ...req.body,
                        subscriber: artistData.subscriber,
                        thumbnail: data.Location,
                    };
                    await updateArtistById(id, artist);
                    res.status(StatusCodes.OK).json({ success: true });
                }
            );
        } else {
            const artist = {
                ...req.body,
                subscriber: artistData.subscriber,
            };
            await updateArtistById(id, artist);
            res.status(StatusCodes.OK).json({ success: true });
        }

    } catch (err) {
        console.log(err);
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ success: false, error: err.message });
    }
};

const getVerificationArtistByID = async (req, res) => {
    try {
        const id = req.params.id;
        const artist = await readArtistById(id);
        console.log('artist.verify', artist)
        res
            .status(StatusCodes.OK)
            .json({ success: true, verified: artist });
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
    update,
    remove,
    readbyName,
    getVerificationArtistByID,
    searchArtist
};
