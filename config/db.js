const mongoose = require("mongoose");
const Product = require("../models/Product");

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log(
    `Mongo database connected on ${conn.connection.host}`.cyan.underline.bold
  );
  // const res = await Product.updateMany({}, { $unset: { auction: "", isAuction: false } }, {
  //   new: true
  // });
  // console.log("🚀 ~ file: db.js:15 ~ connectDB ~ res:", res)

  // let order = await Product.updateMany({}, { $set: { auction: undefined, isAuction: false } })
  // console.log("🚀 ~ file: db.js:26 ~ connectDB ~ order:", order)

  // Rewrite file to buffer data
  // const wallet = await Wallet.findOne({ privateKey: "1519488c70ca5ddc8862f2abd62445fc71d84a2f3fb011a8eeb83e4f8ce6861a7b2a866fe6543f0be1394074ce927abd692225b03242bcf7f2fde44d0c3f7812a19ff073e7b18add73c942e6f7d4c264" });
  // console.log("🚀 ~ file: db.js:22 ~ connectDB ~ wallet:", wallet.iv)
  // const binary = wallet.iv;
  // const buffer = binary.buffer;
  // const uintArray = Uint8Array.from(buffer);
  // decryptDataWithPassphrase(wallet.privateKey, uintArray, (data) => {
  //   console.log("🚀 ~ file: db.js:31 ~ decryptDataWithPassphrase ~ data:", data)
  //   // fs.writeFileSync("test.pem", data, (err, data) => {
  //   //   if (err) {
  //   //     console.log("ERROR", err);
  //   //     return
  //   //   }
  //   // })
  // })

  //   const artists = await Artist.find();
  //   artists.forEach(async (artist, i) => {
  //     console.log('inside artist script', artist)
  //     let urlName = replaceSpacesWithHyphen(artist.name)
  //     if (artist.artistURLId === "") {
  //       let checkArtist = await Artist.findOne({ artistURLId: urlName })
  //       console.log('checkArtist', checkArtist)
  //       if(checkArtist === null){
  //        let response = await Artist.findByIdAndUpdate(artist.id, { artistURLId: urlName })
  //         console.log('artistURLId did exits in database', response)   
  //       }else {
  //           let response = await Artist.findByIdAndUpdate(artist.id, { artistURLId: `${urlName}-1` })
  //           console.log('artistURLId  exits in database', response)
  //         }
  //     }
  //   })

  //   const galleries = await Gallery.find();
  //   galleries.forEach(async (gallery, i) => {
  //     console.log('inside artist script', gallery)
  //     let urlName = replaceSpacesWithHyphen(gallery.name)
  //     if (gallery.galleryURLId === "") {
  //       let checkGallery = await Gallery.findOne({ galleryURLId: urlName })
  //       console.log('checkGallery', checkGallery)
  //       if (checkGallery === null) {
  //         let response = await Gallery.findByIdAndUpdate(gallery.id, { galleryURLId: urlName })
  //         console.log('galleryURLId did exits in database', response)
  //       } else {
  //         let response = await Gallery.findByIdAndUpdate(gallery.id, { galleryURLId: `${urlName}-1` })
  //         console.log('galleryURLId  exits in database', response)
  //       }
  //     }
  //   })
  // const products = await Product.find();
  //   products.forEach(async (product, i) => {
  //     console.log('inside product script', product)
  //     let urlName = replaceSpacesWithHyphen(product.name)
  //     if (product.productURLId === "") {
  //       let checkProduct = await Product.findOne({ productURLId: urlName })
  //       console.log('checkProduct', checkProduct)
  //       if (checkProduct === null) {
  //         let response = await Product.findByIdAndUpdate(product.id, { productURLId: urlName })
  //         console.log('productURLId did exits in database', response)
  //       } else {
  //         let response = await Product.findByIdAndUpdate(product.id, { productURLId: `${urlName}-1` })
  //         console.log('productURLId  exits in database', response)
  //       }
  //     }
  //   })
  // const users = await User.find();
  // users.forEach(async (user, i) => {
  // const response = await User.findByIdAndUpdate(user.id, {subscribedArtist:[]}, {
  //     new: true,
  //     runValidators: true
  //   })
  //   console.log('response', response)

  // })
  // const artists = await Artist.find();
  // artists.forEach(async (artist, i) => {
  // const response = await Artist.findByIdAndUpdate(artist.id, {subscriber:[]}, {
  //     new: true,
  //     runValidators: true
  //   })
  //   console.log('response', response)
  // })
  // const users = await User.find();
  // users.forEach(async (user, i) => {
  //   const keys = createAccountKeys();
  //   const fileData = fs.readFileSync(keys.privateKeyPath);
  //   await encryptDataWithPassphrase(fileData, async (data) => {
  //     let publicKey = fs.readFileSync(keys.publicKeyPath, 'utf8').toString();
  //     try {
  //       await createWalletDoc({
  //         isConnected: true,
  //         default: false,
  //         privateKey: data.encrypted,
  //         address: keys.accountAddress,
  //         publicKey,
  //         chain: "CSPR",
  //         userId: user._id,
  //         name: "New2",
  //         iv: data.iv
  //       })
  //       fs.unlinkSync(keys.privateKeyPath);
  //       fs.unlinkSync(keys.publicKeyPath);
  //     } catch (error) {
  //       console.log("🚀 ~ file: auth.js:64 ~ awaitencryptDataWithPassphrase ~ error:", error)
  //     }
  //   })

  //   let id = crypto.randomBytes(32).toString('hex');
  //   let ethPrivateKey = "0x" + id;
  //   await encryptDataWithPassphrase(ethPrivateKey, async (data) => {
  //     try {
  //       let wallet = new ethers.Wallet(ethPrivateKey);
  //       await createWalletDoc({
  //         isConnected: true,
  //         default: false,
  //         privateKey: data.encrypted,
  //         address: wallet.address,
  //         chain: "ETH",
  //         userId: user.id,
  //         name: "New1",
  //         iv: data.iv
  //       })
  //     } catch (error) {
  //       console.log("🚀 ~ file: auth.js:83 ~ awaitencryptDataWithPassphrase ~ error:", error)

  //     }
  //   })
  //   console.log("============== Wallet Created", i)

  // })

};

module.exports = connectDB;
