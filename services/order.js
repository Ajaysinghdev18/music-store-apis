const Order = require("../models/Order");

const orderDoc = obj => Order.create(obj);

const getOrderDoc = query => {
  return Order.findOne(query);
};

const deleteOrder = query => {
  return Order.findOneAndDelete(query);
};

const findActiveOrder = (id, status) => {
  return Order.findOne({
    $and: [
      {
        orderItems: { $elemMatch: { productId: id } }
      },
      {
        status
      }
    ]
  });
};

const deleteMultipleOrders = query => {
  return Order.deleteMany(query);
};
const allOrders = (query, projection, options) => {
  return Order.find(query, projection, options);
};

const aggregateOrders = pipeline => {
  return Order.aggregate(pipeline);
};

const updateOrderDoc = (condition, object) => {
  return Order.findOneAndUpdate(condition, { $set: object }, { new: true });
}

const orderDocById = (condition, object) =>
  Order.findOneAndUpdate(condition, { $set: object }, { new: true });

const getShopHistoryByUser = id =>
  Order.aggregate([
    { $match: { $and: [{ status: "Processed" }] } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m", date: { $toDate: "$updatedAt" } }
        },
        count: { $sum: { $size: "$orderItems" } },
        price: { $sum: "$totalPrice" }
      }
    },
    {
      $sort: {
        _id: 1
      }
    }
  ]);

module.exports = {
  orderDoc,
  allOrders,
  aggregateOrders,
  updateOrderDoc,
  orderDocById,
  getShopHistoryByUser,
  getOrderDoc,
  deleteOrder,
  findActiveOrder,
  deleteMultipleOrders
};
