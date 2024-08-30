const querystring = require("querystring");
const { StatusCodes } = require("http-status-codes");
const { getOrderDoc, updateOrderDoc } = require("../services/order");
const { getCart } = require("../services/cart");
const { executeNftMinting } = require("../utils/nft");
const { productById } = require("../services/product");
const { readServices, readService } = require("../services/service");
const { confirmTransaction } = require("../utils/taxamo");




const chargeSucceeded = async (req, res) => {
  try {
    const keys = await readService({ name: 'stripe' });
    console.log("🚀 ~ file: stripe.js:16 ~ chargeSucceeded ~ keys:", keys)
    if (keys?.secretKey) {
      const stripe = require('stripe')(keys.secretKey);
      const sig = req.headers['stripe-signature'];
      let event;
      let endpointSecret = process.env.BACKEND_URL.includes('dev') ? process.env.STRIPE_DEV_ORDER_WEBHOOK_ENDPOINT_SECRET : process.env.STRIPE_BETA_ORDER_WEBHOOK_ENDPOINT_SECRET;
      try {
        event = await stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err) {
        console.log("🚀 ~ file: stripe.js:50 ~ chargeSucceeded ~ err:", err)
        return res.status(400).send(`Webhook Error: ${err.message}`);

      }
      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentEvent = event.data.object;
          if (paymentEvent.status == 'succeeded') {
          }
          break;
        case 'checkout.session.completed':
          try {
            const sessionEvent = event.data.object;
            const { status, payment_intent, client_reference_id } = sessionEvent;
            const order = await getOrderDoc({ clientReferenceId: client_reference_id }).populate('userId');
            if (status == 'complete' && order?.status == 'Created') {
              console.log('==========================> Order execution started! <======================')
              let orderedProducts = [];
              for (let i = 0; i < order.orderItems.length; i++) {
                const fullProduct = await productById(order.orderItems[i].productId);
                orderedProducts.push(fullProduct);
              }
              const nfts = await executeNftMinting(orderedProducts, order.ethereumWalletKey, order.casperWalletKey, order.userId);
              await confirmTransaction(order.txKey);
              const object = {
                paidAt: Date.now(),
                stripePaymentId: payment_intent,
                status: 'Processed',
                nfts: nfts,
                invoiceAddress: {
                  streetName: order.userId?.addressLine1 || '',
                  buildingNumber: order.userId?.addressLine2 || '',
                  country: order.userId?.country || '',
                  city: order.userId?.city || '',
                  region: order.userId?.region || '',
                  zip: order.userId?.zip || ''
                }
              };
              await updateOrderDoc({ _id: order._id }, object);
              console.log('==========================> Order execution done! <======================');
            }
            break;
          } catch (error) {
            console.log("🚀 ~ file: stripe.js:37 ~ chargeSucceeded ~ error:", error)
          }

        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.log("🚀 ~ file: ipn.js ~ line 71 ~ updateTransaction ~ err", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};


module.exports = { chargeSucceeded };
