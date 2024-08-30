const Order = require("../models/Order");
const { getOrderDoc } = require("../services/order");

const invoiceInfo = async (req, res) => {
  const { event_type } = req.body;
  const { custom_id, invoice_number } = req.body.transaction;
  try {
    if (event_type == 'invoice.created') {
      const order = await getOrderDoc({ taxamoId: custom_id })
      if (order) {
        order.taxamoInvoiceNumber = invoice_number;
        await order.save();
      }
    }
    res.send('Ok')
  } catch (err) {
    console.log("🚀 ~ file: taxamo.js:11 ~ invoiceInfo ~ err", err)
  }
};


module.exports = { invoiceInfo };
