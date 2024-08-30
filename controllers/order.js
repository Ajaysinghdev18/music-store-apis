const { StatusCodes } = require("http-status-codes");
const { sendOrderEmailNotification } = require("../services/email");
const fs = require('fs');
const ethers = require('ethers');
const path = require('path');
const Location = require("../models/Location");
const Web3 = require('web3');
const web3 = new Web3(process.env.ETHEREUM_TESTNET_PROVIDER);
const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_TESTNET_PROVIDER); // Replace with your Infura URL or any Ethereum node URL

const {
  orderDoc,
  allOrders,
  updateOrderDoc,
  orderDocById,
  aggregateOrders,
  getOrderDoc
} = require("../services/order");
const { getCart, removeCartKey, updateCart } = require("../services/cart");
const { createMessage } = require("../services/message");
const {
  calculateTaxAmount,
  storeTransaction,
  confirmTransaction,
  getLocationMetadata
} = require("../utils/taxamo");
const { v4: uuidv4 } = require("uuid");
const { ORDER_DELIVERED } = require("../constants/messages");
const { updateBalance, getBalanceByUserId } = require("../services/balance");
const { getBalanceWithConversionRate } = require("../utils/balance");
const {
  createTransaction,
  getTransaction
} = require("../services/transaction");
const { productById } = require("../services/product");
const { readUser } = require("../services/user");
const { executeNftMinting } = require("../utils/nft");
const { getNftByIds, getAllNfts } = require("../services/mint");
const { readWallet, readAllWallets, updateWalletDoc } = require("../services/wallet");
const { decryptDataWithPassphrase } = require("../utils/helpers");
const { sendTransfer, getCsprAccountBalance } = require("../utils/cspr");
const { getByEmailTypeEmailTemplates } = require('../services/email');
const { readService } = require("../services/service");
const { getCoupon } = require("../services/coupon");

const createOrder = async (req, res) => {
  try {
    const {
      products,
      totalPrice,
      name,
      phoneNumber,
      email,
      note,
      isGift,
      userId,
      paymentMethod,
      crypto,
      buyerIpAddress,
      casperWalletKey,
      ethereumWalletKey,
      clientReferenceId,
      discount
    } = req.body;
    let order;
    let taxamoId = uuidv4();
    const {
      geopluginCountryCode,
      geopluginCurrencyCode
    } = await getLocationMetadata(buyerIpAddress);
    const taxRes = await calculateTaxAmount(
      geopluginCurrencyCode,
      totalPrice,
      buyerIpAddress,
      geopluginCountryCode
    );
    const {
      tax_amount,
      billing_country_code,
      currency_code
    } = taxRes.transaction;
    const user = await readUser({ _id: userId });
    const cart = await getCart({ userId });
    let discountedPrice;
    let totalBalance = totalPrice;
    if (discount > 0) {
      discountedPrice = totalPrice * (1 - discount / 100);
      totalBalance = discountedPrice;
    }
    if (crypto && crypto.length > 0) {
      const balance = await getBalanceByUserId(userId);
      const userBalance = await getBalanceWithConversionRate(balance, crypto);
      const totalAvailableBalance = crypto.map(c =>
        userBalance[c]?.usd ? userBalance[c].usd : 0
      );
      if (totalAvailableBalance < totalBalance) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: "Insufficient Balance"
        });
      }
      const updatedBalances = {};
      let casperDeployHash = null;
      // let balanceLeft = discountedPrice;
      for (let i = 0; i < crypto.length; i++) {
        const c = crypto[i];
        const availableBalance = userBalance[c]?.usd ? userBalance[c].usd : 0;

        if (availableBalance > totalBalance) {
          updatedBalances[c] = (
            (availableBalance - +parseFloat(totalBalance).toFixed(8)) /
            userBalance[c].rate
          ).toFixed(8);
          const updatedCrypto = (
            parseFloat(totalBalance).toFixed(8) / userBalance[c].rate
          ).toFixed(8);

          // Casper Decimals
          const casperDecimals = 1000000000;

          let nfts = null;
          const userWallets = await readAllWallets({ userId, chain: crypto[i] })
          console.log("🚀 ~ file: order.js:111 ~ createOrder ~ userWallets:", userWallets.length);
          let actualUserBalanceInCrypto = 0;
          let userWalletsTodeduct = [];
          const checkAllWalletsBalance = async () => {
            for (const wallet of userWallets) {
              try {
                if (crypto[i] == 'CSPR') {
                  let userWalletBalance = await getCsprAccountBalance(wallet.address)
                  if (!userWalletBalance) {
                    userWalletBalance = '0'
                  }
                  let balanceInt = +(userWalletBalance.toString() / casperDecimals).toFixed(4);
                  console.log("🚀 ~ file: order.js:126 ~ userWallets.forEach ~ balanceInt:", balanceInt)
                  actualUserBalanceInCrypto += balanceInt
                  if (balanceInt > 0) {
                    userWalletsTodeduct.push({ amount: balanceInt, address: wallet.address })
                  }
                } else if (crypto[i] == 'ETH') {
                  const userWalletBalance = await web3.eth.getBalance(wallet.address);
                  let balanceInEther = +web3.utils.fromWei(userWalletBalance, 'ether');
                  actualUserBalanceInCrypto += balanceInEther
                  if (balanceInEther > 0) {
                    userWalletsTodeduct.push({ amount: balanceInEther, address: wallet.address })
                  }
                }
              } catch (error) {
                console.log("🚀 ~ file: order.js:119 ~ userWallets.forEach ~ error:", error)
              }
            }
          }
          let isCryptoPaymentDone = false;
          if (crypto[i] == 'CSPR') {
            await checkAllWalletsBalance()
            if (actualUserBalanceInCrypto > updatedCrypto) {
              const targetAmount = updatedCrypto;;
              let sentAmount = 0;
              // Shuffle the balances array randomly
              const shuffledBalances = userWalletsTodeduct.sort(() => Math.random() - 0.5);
              for (let l = 0; l < shuffledBalances.length; l++) {
                const balance = shuffledBalances[l];
                if (balance.amount > 0) {
                  const amountToSend = Math.min(balance.amount, targetAmount - sentAmount);
                  sentAmount += amountToSend;
                  balance.amount -= amountToSend;
                  let userWallet = await readWallet({ address: balance.address })
                  const { privateKey, iv } = userWallet;
                  const folder = path.join("./files/", "casper_keys");
                  const privateKeyPath = `${folder}/${userId}-private_key.pem`
                  const publicKeyPath = `${folder}/${userId}-public_key.pem`
                  const binary = iv;
                  const buffer = binary.buffer;
                  const uintArray = Uint8Array.from(buffer);
                  const { CSPR_WALLET_ADDRESS } = process.env;
                  const decryptionProcess = await decryptDataWithPassphrase(privateKey, uintArray);
                  if (decryptionProcess) {
                    fs.writeFileSync(privateKeyPath, decryptionProcess, (err, data) => {
                      if (err) {
                        console.log("ERROR", err);
                        return
                      }
                    })
                    fs.writeFileSync(publicKeyPath, userWallet.publicKey, (err, data) => {
                      if (err) {
                        console.log("ERROR", err);
                        return
                      }
                    })
                    console.log(`Sent ${amountToSend} crypto from balance with ID ${balance.address}`);
                    casperDeployHash = await sendTransfer({ to: CSPR_WALLET_ADDRESS, amount: amountToSend }, { publicKeyPath, privateKeyPath }, res);
                    let walletAmount = userWallet?.balance || 0;
                    await updateWalletDoc({ _id: userWallet._id }, { balance: (walletAmount - amountToSend).toFixed(4) })
                    await createTransaction({
                      userId: userId,
                      type: "Order",
                      currency: c,
                      amount: amountToSend,
                      txKey: casperDeployHash,
                      from: balance.address,
                      to: CSPR_WALLET_ADDRESS,
                      status: "Paid",
                    });
                    fs.unlinkSync(publicKeyPath);
                    fs.unlinkSync(privateKeyPath);
                    if (sentAmount >= targetAmount) {
                      console.log(`Target amount of ${targetAmount} crypto sent!`);
                      isCryptoPaymentDone = true;
                      break;
                    }
                  }
                }
              }
            } else {
              return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                error: "Insufficient Casper Balance"
              });
            }

          }
          if (crypto[i] == 'ETH') {
            await checkAllWalletsBalance()
            if (actualUserBalanceInCrypto > updatedCrypto) {
              const targetAmount = updatedCrypto;;
              let sentAmount = 0;
              // Shuffle the balances array randomly
              const shuffledBalances = userWalletsTodeduct.sort(() => Math.random() - 0.5);
              for (let l = 0; l < shuffledBalances.length; l++) {
                const balance = shuffledBalances[l];
                if (balance.amount > 0) {
                  const amountToSend = Math.min(balance.amount, targetAmount - sentAmount);
                  sentAmount += amountToSend;
                  balance.amount -= amountToSend;
                  let userWallet = await readWallet({ address: balance.address })
                  // console.log("🚀 ~ file: order.js:227 ~ createOrder ~ userWallet:", userWallet)
                  const binary = userWallet.iv;
                  const buffer = binary.buffer;
                  const uintArray = Uint8Array.from(buffer);
                  const senderAddress = userWallet.address;
                  const senderPrivateKey = await decryptDataWithPassphrase(userWallet.privateKey, uintArray)
                  const senderAccount = web3.eth.accounts.privateKeyToAccount(senderPrivateKey);
                  web3.eth.accounts.wallet.add(senderAccount);
                  web3.eth.defaultAccount = senderAddress;
                  const receiverAddress = process.env.ETHEREUM_PUBLIC_KEY_FOR_TRANSACTIONS;
                  const amountToBeSend = web3.utils.toWei(amountToSend.toString(), 'ether');
                  // Transaction object
                  const txObject = {
                    to: receiverAddress,
                    value: amountToBeSend, // Amount of Ether to send (in this case, 0.1 Ether)
                  };
                  // Connect to the Ethereum network using your private key
                  const wallet = new ethers.Wallet(senderPrivateKey, provider);
                  // Send the transaction
                  let transactionHash;
                  try {
                    console.log('-------------------- SENDING ETH TRANSACTION TO NETWORK --------------------')
                    const { hash } = await wallet.sendTransaction(txObject)
                    transactionHash = hash;
                    console.log("🚀 ~ file: order.js:251 ~ createOrder ~ transactionHash:", transactionHash)
                  } catch (error) {
                    console.log("🚀 ~ file: order.js:256 ~ createOrder ~ error:", error)
                    return res.status(StatusCodes.BAD_REQUEST).json({
                      success: false,
                      error: error
                    });
                  }
                  console.log(`Sent ${amountToSend} crypto from balance with ID ${balance.address}`);
                  if (transactionHash) {
                    let walletAmount = userWallet?.balance || 0;
                    await updateWalletDoc({ _id: userWallet._id }, { balance: (walletAmount - amountToSend).toFixed(4) })
                    await createTransaction({
                      userId: userId,
                      type: "Order",
                      currency: c,
                      amount: amountToSend,
                      txKey: transactionHash,
                      from: balance.address,
                      to: process.env.ETHEREUM_PUBLIC_KEY_FOR_TRANSACTIONS,
                      status: "Paid",
                    });
                  }
                  if (sentAmount >= targetAmount) {
                    console.log(`Target amount of ${targetAmount} crypto sent!`);
                    isCryptoPaymentDone = true;
                    break;
                  }

                }
              }
            } else {
              return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                error: "Insufficient Eth Balance"
              });
            }

          }

          if (isCryptoPaymentDone) {
            nfts = await executeNftMinting(products, ethereumWalletKey, casperWalletKey, userId);
            console.log("🚀 ~ file: order.js:302 ~ createOrder ~ nfts:", nfts)
            if (nfts.length == 0) {
              return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                error: "Something went wrong with minting nft."
              });
            }
            order = await orderDoc({
              orderItems: products.map(product => {
                const cartProduct = cart.products.find((cartProduct) => cartProduct.productId == product.id);
                return {
                  ...product,
                  productId: product.id,
                  productName: product.name,
                  features: cartProduct.features
                }
              }),
              totalPrice,
              userId: req?.user?.id ? req.user.id : userId,
              name,
              phoneNumber,
              email,
              note,
              isGift,
              status: "Processed",
              paymentMethod,
              vat: tax_amount,
              ethereumWalletKey,
              casperWalletKey,
              nfts,
              discount,
              taxamoId,
              invoiceAddress: {
                streetName: user.addressLine1 || '',
                buildingNumber: user.addressLine2 || '',
                country: user.country || '',
                city: user.city || '',
                region: user.region || '',
                zip: user.zip || ''
              }
            });
            const { transaction } = await storeTransaction(
              products,
              currency_code,
              totalPrice,
              null,
              email,
              name,
              note,
              billing_country_code,
              taxamoId,
              user.country,
              user.region,
              user.city,
              user.addressLine1,
              user.addressLine2,
            );
            await confirmTransaction(transaction.key);
            break;
          }
        }

      }
      await updateBalance(
        {
          _id: balance._id
        },
        updatedBalances
      );
    } else {
      const { transaction } = await storeTransaction(
        products,
        currency_code,
        totalPrice,
        null,
        email,
        name,
        note,
        billing_country_code,
        taxamoId,
        user.country,
        user.region,
        user.city,
        user.addressLine1,
        user.addressLine2,
      );
      order = await orderDoc({
        orderItems: products.map(product => {
          const cartProduct = cart.products.find((cartProduct) => cartProduct.productId == product.id);
          return {
            ...product,
            productId: product.id,
            productName: product.name,
            features: cartProduct.features
          }
        }),
        totalPrice,
        userId: req?.user?.id ? req.user.id : userId,
        name,
        phoneNumber,
        discount,
        email,
        note,
        isGift,
        paymentMethod,
        vat: tax_amount,
        ethereumWalletKey,
        casperWalletKey,
        taxamoId,
        clientReferenceId,
        txKey: transaction?.key
      });
    }

    await createMessage({
      owner: userId,
      content: ORDER_DELIVERED
    });

    // const curUser = await readUser({ _id: userId });
    // const templates = await getByEmailTypeEmailTemplates('order_confirmation')
    // await sendOrderEmailNotification(curUser, order, templates);


    if (cart) {
      const coupon = await getCoupon({ _id: cart.coupon })
      cart.products = [];
      cart.total = 0;
      if (coupon) {
        coupon.isValid = false;
        cart.discount = 0;
        await removeCartKey(cart._id, "coupon", "");
        await coupon.save();
      }
      await cart.save();
    }

    res.status(StatusCodes.CREATED).json({ success: true, orderId: order._id, orderItems: order.orderItems });
  } catch (error) {
    console.log("🚀 ~ file: order.js ~ line 13 ~ createOrder ~ error", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    let { query, projection, options, aggregate } = req.query;
    if (aggregate) {
      aggregate = JSON.parse(aggregate);

      const orders = await aggregateOrders(aggregate);
      res.status(StatusCodes.OK).json({ success: true, orders });
    } else {
      let newQuery = {};
      if (query) {
        query = JSON.parse(query);
        Object.entries(query).map(([key, value]) => {
          if (typeof value === "string" && key !== "userId") {
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

      const orders = await allOrders(newQuery, projection, options);
      const all = await allOrders(newQuery);

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
      res.status(StatusCodes.OK).json({ success: true, orders, pagination });
    }
  } catch (error) {
    console.log("🚀 ~ file: order.js ~ line 33 ~ getAllOrders ~ error", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

const getNfts = async (req, res) => {
  try {
    let { query, projection, options, aggregate } = req.query;
    if (aggregate) {
      aggregate = JSON.parse(aggregate);

      const orders = await aggregateOrders(aggregate);
      res.status(StatusCodes.OK).json({ success: true, orders });
    } else {
      let newQuery = {};
      if (query) {
        query = JSON.parse(query);
        Object.entries(query).map(([key, value]) => {
          if (typeof value === "string" && key !== "userId") {
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

      const nfts = await getAllNfts(newQuery, projection, options).populate('productId');
      const all = await getAllNfts(newQuery);

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
      res.status(StatusCodes.OK).json({ success: true, nfts, pagination });
    }
  } catch (error) {
    console.log("🚀 ~ file: order.js ~ line 33 ~ getAllOrders ~ error", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    await updateOrderDoc({ _id: orderId }, req.body);

    res
      .status(StatusCodes.OK)
      .json({ success: true, msg: "Successfully updated" });
  } catch (error) {
    console.log("🚀 ~ file: order.js ~ line 103 ~ updateOrder ~ error", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    let order = await orderDocById({ _id: orderId }).populate('nfts').populate('userId');;
    const user = await readUser({ _id: order?.userId?._id })
    let newOrderItems = [];

    let products = [];
    for (let i = 0; i < order.orderItems.length; i++) {
      const product = await productById(order.orderItems[i].productId).populate(
        "category"
      )

      if (!product) {
        return res
          .status(404)
          .json({ success: false, msg: "Product doess not exist anymore!" });
      }

      newOrderItems[i] = {
        ...order.orderItems[i]._doc,
        category: product.category.map(({ name }) => name),
        currency: product.currency,
      };
      products.push(product)
    }
    const nfts = await getNftByIds(order.nfts);
    nfts.forEach((nft) => {
      const index = newOrderItems.findIndex((product) => product.productId.equals(nft.productId));
      newOrderItems[index] = {
        ...newOrderItems[index],
        nftDetail: nft,
      }
    })
    const cryptoOrderInfo = await getTransaction({ txId: order._id });
    if (cryptoOrderInfo) {
      order = {
        ...order._doc,
        orderItems: newOrderItems,
        cryptoInfo: cryptoOrderInfo
      };
    } else {
      order = {
        ...order._doc,
        orderItems: newOrderItems
      };
    }
    order = {
      ...order,
      username: user?.username
    };
    res.status(StatusCodes.OK).json({ success: true, order });
  } catch (error) {
    console.log("🚀 ~ file: order.js ~ line 62 ~ getOrderById ~ error", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

const getVat = async (req, res) => {
  try {
    const { amountToBePaid, buyerIpAddress } = req.query;

    const location = await Location.findOne({
      geoplugin_request: buyerIpAddress
    });
    let geoplugin_currencySymbol;
    let geoplugin_currencyCode;
    let geoplugin_countryCode;

    // if (!location) {
    const {
      geopluginCountryCode,
      geopluginCurrencySymbol,
      geopluginCurrencyCode
    } = await getLocationMetadata(buyerIpAddress);
    geoplugin_currencySymbol = geopluginCurrencySymbol;
    geoplugin_currencyCode = geopluginCurrencyCode;
    geoplugin_countryCode = geopluginCountryCode;
    console.log("🚀 ~ file: order.js:607 ~ getVat ~ geoplugin_currencySymbol:", geoplugin_currencySymbol, geoplugin_currencyCode, geoplugin_countryCode)
    //   await Location.create({
    //     geoplugin_countryCode,
    //     geoplugin_currencySymbol,
    //     geoplugin_currencyCode
    //   });
    // } else {
    //   geoplugin_currencySymbol = location.geoplugin_currencySymbol;
    //   geoplugin_currencyCode = location.geoplugin_currencyCode;
    //   geoplugin_countryCode = location.geoplugin_countryCode;
    // }
    const taxRes = await calculateTaxAmount(
      geoplugin_currencyCode,
      amountToBePaid,
      buyerIpAddress,
      geoplugin_countryCode
    );
    const {
      amount,
      tax_amount,
      tax_region,
      billing_country_code,
      tax_rate,
      total_amount,
      tax_supported
    } = taxRes.transaction;
    res.status(StatusCodes.OK).json({
      success: true,
      tax: {
        amount,
        geoplugin_currencySymbol,
        tax_amount,
        tax_region,
        billing_country_code,
        tax_rate,
        total_amount,
        tax_supported
      }
    });
  } catch (error) {
    console.log("🚀 ~ file: order.js ~ line 93 ~ getVat ~ error", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    delete req.body.orderId;
    let orderedProducts = [];
    if (status === "Processed") {
      const orderDoc = await getOrderDoc({ _id: orderId })
      for (let i = 0; i < orderDoc.orderItems.length; i++) {
        const fullProduct = await productById(orderDoc.orderItems[i].productId);
        orderedProducts.push(fullProduct);
      }
      const nfts = await executeNftMinting(orderedProducts, orderDoc.ethereumWalletKey, orderDoc.casperWalletKey, req.user.id);
      const cart = await getCart({ userId: req.user.id });
      if (cart) {
        cart.products = [];
        cart.total = 0;
        await cart.save();
      }
      if (nfts.length > 0) {
        req.body.nfts = nfts;
      }
    }
    await updateOrderDoc({ _id: orderId }, req.body);
    res.status(StatusCodes.OK).json({ success: true, orderDoc });
  } catch (error) {
    console.log(
      "🚀 ~ file: order.js ~ line 203 ~ updateOrderStatus ~ error",
      error
    );
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};


const createCheckoutSession = async (req, res) => {
  try {
    const { email, currency, items, clientReferenceId } = req.body;
    console.log("🚀 ~ file: order.js:676 ~ createCheckoutSession ~ clientReferenceId:", clientReferenceId)
    const transactionLines = items.map((product) => {
      return {
        price_data: {
          currency,
          product_data: {
            name: product.productName
          },
          unit_amount: product.price * 100,
        },
        quantity: 1
      }
    })
    const keys = await readService({ name: 'stripe' });
    if (keys?.secretKey) {
      const stripe = require('stripe')(keys.secretKey);
      const order = await getOrderDoc({ clientReferenceId })
      const session = await stripe.checkout.sessions.create({
        customer_email: email,
        billing_address_collection: 'auto',
        line_items: transactionLines,
        mode: 'payment',
        success_url: `${process.env.WEB_APP_URL}/checkout/thankyou?orderId=${order._id}`,
        cancel_url: `${process.env.WEB_APP_URL}?canceled=true`,
        client_reference_id: clientReferenceId,
      })
      res.status(201).json({ success: true, url: session.url })
    }
  } catch (err) {
    console.log("🚀 ~ file: ipn.js ~ line 71 ~ updateTransaction ~ err", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};


module.exports = {
  createOrder,
  getAllOrders,
  updateOrder,
  getOrderById,
  getVat,
  updateOrderStatus,
  getNfts,
  createCheckoutSession
};
