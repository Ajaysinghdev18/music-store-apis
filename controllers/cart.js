const { StatusCodes } = require("http-status-codes");

const accumulator = require("../utils/reduce");
const { isEqualIds } = require("../utils/dbOperation");
const { getCart, createCart, updateCart, removeCartKey } = require("../services/cart");
const { createMessage } = require("../services/message");

const Product = require("../models/Product");

const {
  PRODUCT_ADDED_TO_CART_SUCCESSFULLY,
  PRODUCT_REMOVED_FROM_CART
} = require("../constants/messages");

const addToCart = async (req, res) => {
  try {
    const { productId, fingerprint, price, userId, currency, selectedFeature } = req.body;
    const features = JSON.parse(selectedFeature);
    let cart = await getCart({ fingerprint });
    if (!cart) {
      const cartObj = {
        products: [{ productId, price, currency, features }],
        fingerprint,
        total: price,
        userId,
      };
      await createCart(cartObj);

      cart = await getCart({ fingerprint });


      const products = [];
      for (const item of cart.products) {
        const product = await Product.findById(item.productId)
        if (product) {
          product._doc.productFeatures = features;
          products.push(product);
        }
      }

      cart._doc.products = products;

      await createMessage({
        owner: userId,
        content: PRODUCT_ADDED_TO_CART_SUCCESSFULLY
      });

      return res
        .status(StatusCodes.CREATED)
        .json({ success: true, msg: "Added successfully", cart });
    } else {
      const isExistInCart = cart.products.some(product =>
        isEqualIds(product.productId, productId)
      );

      if (isExistInCart) {
        return res
          .status(StatusCodes.CONFLICT)
          .json({ success: false, msg: "Already Added to the cart" });
      } else {
        const newProduct = {
          productId,
          currency,
          price,
          features
        };
        cart.products.push(newProduct);
        await cart.save();

        const products = [];
        for (const item of cart.products) {
          const product = await Product.findById(item.productId)
          if (product) {
            product._doc.productFeatures = features;
            products.push(product);
          }
        }
        cart._doc.products = products;
        cart._doc.total = accumulator(cart.products);
        await createMessage({
          owner: userId,
          content: PRODUCT_ADDED_TO_CART_SUCCESSFULLY
        });

        return res
          .status(StatusCodes.CREATED)
          .json({ success: true, msg: "Added successfully", cart });
      }
    }
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId, fingerprint, userId } = req.body;
    const cart = await getCart({ fingerprint });

    if (userId) {
      cart.userId = userId;
    }
    if (cart) {
      const productIndex = cart.products.findIndex(prod => {
        return isEqualIds(prod.productId, productId);
      });

      if (productIndex > -1) {
        cart.products.splice(productIndex, 1);
        await cart.save();

        const products = [];
        for (const item of cart.products) {
          const product = await Product.findById(item.productId);
          if (product) {
            if (item.isAuction) {
              product.price = item.price;
              product._doc.timeToBuy = item.timeToBuy
            }
            product._doc.selectedFeatures = item.features;
            products.push(product);
          }
        }
        cart._doc.products = products;
        cart._doc.total = accumulator(cart.products);
        await createMessage({
          owner: userId,
          content: PRODUCT_REMOVED_FROM_CART
        });

        return res
          .status(StatusCodes.OK)
          .json({ success: true, msg: "Removed", cart });
      } else {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ success: true, msg: "Not Found" });
      }
    }
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const getCartDetails = async (req, res) => {
  try {
    const { fingerprint } = req.query;
    const cart = await getCart({ fingerprint });
    const products = [];

    if (cart) {
      for (const item of cart.products) {
        const product = await Product.findById(item.productId)
        if (product) {
          if (item.isAuction) {
            product.price = item.price;
            product._doc.timeToBuy = item.timeToBuy
          }
          product._doc.selectedFeatures = item.features;
          products.push(product);
        } else {
          return res.status(StatusCodes.OK).json({ success: true, cart: {} });
        }
      }
      let totalCartAmount = products.reduce(
        (previousValue, currentValue) => previousValue + currentValue.price,
        0
      );
      cart._doc.products = products;
      cart._doc.total = totalCartAmount;
    } else {
      return res.status(StatusCodes.OK).json({ success: true, cart: {} });
    }
    return res.status(StatusCodes.OK).json({ success: true, cart });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const addDiscountToCart = async (req, res) => {
  try {
    const { fingerprint, discount, couponId } = req.body;
    const cart = await getCart({ fingerprint });
    if (cart && couponId || discount === 0 && cart) {
      await updateCart(fingerprint, { discount: discount, coupon: couponId })
    }
    if (!couponId && discount === 0) {
      await removeCartKey(cart._id, "coupon", "")
    }
    res.status(StatusCodes.OK).json({ success: true });
  } catch (e) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: e.message });
  }
}

module.exports = { addToCart, removeFromCart, getCartDetails, addDiscountToCart };
