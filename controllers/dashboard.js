const { StatusCodes } = require("http-status-codes");
const moment = require("moment");

const { aggregateProducts } = require("../services/product");
const { aggregateOrders } = require("../services/order");
const { aggregateUsers } = require("../services/user");
const {aggregateArtists} = require("../services/artist");

const getPeriodQuery = (period, type = "", isPreview) => {
  let dateFormat;
  let untilDate;
  let fromDate;
  if (period === "1h") {
    dateFormat = "%H:%M";
    untilDate = moment()
      .add(-1, "h")
      .toDate();
    fromDate = moment()
      .add(-2, "h")
      .toDate();
  } else if (period === "24h") {
    dateFormat = "%m-%d %H";
    untilDate = moment()
      .add(-24, "h")
      .toDate();
    fromDate = moment()
      .add(-48, "h")
      .toDate();
  } else if (period === "7d") {
    dateFormat = "%Y-%m-%d";
    untilDate = moment()
      .add(-7, "d")
      .toDate();
    fromDate = moment()
      .add(-14, "d")
      .toDate();
  } else if (period === "30d") {
    dateFormat = "%m-%d";
    untilDate = moment()
      .add(-1, "M")
      .toDate();
    fromDate = moment()
      .add(-2, "M")
      .toDate();
  } else if (period === "3m") {
    dateFormat = "%Y-%m";
    untilDate = moment()
      .add(-3, "M")
      .toDate();
    fromDate = moment()
      .add(-6, "M")
      .toDate();
  } else if (period === "6m") {
    dateFormat = "%Y-%m";
    untilDate = moment()
      .add(-6, "M")
      .toDate();
    fromDate = moment()
      .add(-12, "M")
      .toDate();
  } else if (period === "1y") {
    dateFormat = "%Y-%m";
    untilDate = moment()
      .add(-12, "M")
      .toDate();
    fromDate = moment()
      .add(-24, "M")
      .toDate();
  } else {
    dateFormat = "%Y-%m";
    untilDate = "";
    fromDate = "";
  }
  const query = {};
  if (isPreview) {
    if (fromDate) {
      query.createdAt = { $gt: fromDate };
      if (untilDate) {
        query.$and = [
          { createdAt: { $gt: fromDate } },
          { createdAt: { $lt: untilDate } }
        ];
      }
    }
  } else {
    if (untilDate) {
      query.createdAt = { $gt: untilDate };
    }
    if (type) {
      query.type = type;
    }
  }
  return { query, dateFormat }
}
const getQuery = (period, type = "", isPreview = false) => {
  const { query, dateFormat } = getPeriodQuery(period, type, isPreview)
  return [
    { $match: { ...query } },
    {
      $group: {
        _id: isPreview
          ? !type
            ? "$type"
            : null
          : {
            $dateToString: {
              format: dateFormat,
              date: { $toDate: "$createdAt" }
            }
          },
        count: { $sum: 1 },
        price: { $sum: "$price" }
      }
    },
    {
      $sort: {
        _id: 1
      }
    }
  ];
};

const sanitizeData = (data, period) => {
  const result = [];
  let dateType;
  let dateFormat;
  let cnt;
  if (period === "1h") {
    cnt = 60;
    dateType = "minute";
    dateFormat = "HH:mm";
  } else if (period === "24h") {
    cnt = 24;
    dateType = "hour";
    dateFormat = "MM-DD HH";
  } else if (period === "7d") {
    cnt = 7;
    dateType = "day";
    dateFormat = "yyyy-MM-DD";
  } else if (period === "30d") {
    cnt = 30;
    dateType = "day";
    dateFormat = "MM-DD";
  } else if (period === "3m") {
    cnt = 3;
    dateType = "month";
    dateFormat = "yyyy-MM";
  } else if (period === "6m") {
    cnt = 6;
    dateType = "month";
    dateFormat = "yyyy-MM";
  } else if (period === "1y") {
    cnt = 12;
    dateType = "month";
    dateFormat = "yyyy-MM";
  } else {
    cnt = moment().diff(moment(data[0]._id), "months") + 2;
    dateType = "month";
    dateFormat = "yyyy-MM";
  }
  for (let i = 0; i <= cnt; i++) {
    const _id = moment()
      .add(-i, dateType)
      .format(dateFormat);
    const item = data.find(d => d._id === _id);
    if (item) {
      result.unshift(item);
    } else {
      result.unshift({ _id, count: 0, price: 0 });
    }
  }
  return result;
};

const calculateCounts = data => {
  let tot = 0;
  for (let i = 0; i < data.length; i++) {
    tot += data[i].count;
  }
  return tot;
};

const calculatePayments = data => {
  let ratingPaymentsType = {
    credit: 0,
    paypal: 0,
    cryptoCurrency: 0,
    prepayCrypto: 0,
  };
  let tot = 0;
  for (let i = 0; i < data.length; i++) {
    switch (data[i]._id) {
      case 'credit':
        ratingPaymentsType.credit = data[i].count;
        break;
      case 'paypal':
        ratingPaymentsType.paypal  = data[i].count;
        break;
      case 'crypto-currency':
        ratingPaymentsType.cryptoCurrency  = data[i].count;
        break;
      default:
        ratingPaymentsType.prepayCrypto  = data[i].count;
        break;
    }
    tot += data[i].count;
  }
  ratingPaymentsType.credit /= tot;
  ratingPaymentsType.paypal /= tot;
  ratingPaymentsType.cryptoCurrency /= tot;
  ratingPaymentsType.prepayCrypto /= tot;
  return ratingPaymentsType;
};

const calculateRating = (cur, prev) => {
  let rating;
  if (prev === 0) {
    rating = 1;
  } else {
    rating = cur / prev;
    if (rating < 1) {
      rating *= -1;
    }
  }
  return rating;
};

const getDashData = async (req, res) => {
  try {
    const { period } = req.query;

    // Get objects
    const songProducts = await aggregateProducts(getQuery(period, "song"));
    const eventProducts = await aggregateProducts(
      getQuery(period, "virtual_event")
    );
    const orders = await aggregateOrders(getQuery(period));
    const users = await aggregateUsers(getQuery(period));
    const artists = await aggregateArtists(getQuery(period));
    const previewProducts = await aggregateProducts(getQuery(period, "", true));
    const previewOrders = await aggregateOrders(
      getQuery(period, "order", true)
    );
    const previewUsers = await aggregateUsers(getQuery(period, "user", true));
    const previewArtists = await aggregateArtists(getQuery(period, "artist", true));
    const ratingQuery = getPeriodQuery(period).query
    const paymentsType = await aggregateOrders([
      {
        $match: ratingQuery
      },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 }
        }
      }
    ]);
    const ratingPayments = calculatePayments(paymentsType);
    // calculate current counts
    const totalTraffic = calculateCounts(songProducts) + calculateCounts(eventProducts);
    const totalOrders = calculateCounts(orders);
    const totalAccount = calculateCounts(users);
    const totalArtists = calculateCounts(artists);

    // calculate preview period counts
    const prevTotTraffic = calculateCounts(previewProducts);
    const prevOrders = calculateCounts(previewOrders);
    const prevAccount = calculateCounts(previewUsers);
    const prevArtists = calculateCounts(previewArtists);

    // rating
    const ratingTraffic = calculateRating(totalTraffic, prevTotTraffic);
    const ratingAccount = calculateRating(totalAccount, prevAccount);
    const ratingOrder = calculateRating(totalOrders, prevOrders);
    const ratingArtist = calculateRating(totalArtists, prevArtists);

    // make dashboard graph data
    const songGraphData = sanitizeData(songProducts, period);
    const eventGraphData = sanitizeData(eventProducts, period);
    const orderGraphData = sanitizeData(orders, period);

    res.status(200).send({
      songs: songGraphData,
      events: eventGraphData,
      orders: orderGraphData,
      totalTraffic: totalTraffic,
      totalOrders: totalOrders,
      totalAccount: totalAccount,
      totalArtist: totalArtists,
      ratingOrder: ratingOrder,
      ratingTraffic: ratingTraffic,
      ratingAccount: ratingAccount,
      ratingArtist: ratingArtist,
      ratingPayments: ratingPayments,
    });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

module.exports = {
  getDashData
};
