require('colors')
const express = require("express");

const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const connectDb = require("./config/db");
const V1Doc = YAML.load("./api.v1.yaml");
const V2Doc = YAML.load("./api.v2.yaml");
const app = express();
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const transactionRoutes = require("./routes/transaction");
const checkoutRoutes = require("./routes/order");
const cartRoutes = require("./routes/cart");
const paymentRoutes = require("./routes/payment");
const balanceRoutes = require("./routes/balance");
const kycRoutes = require("./routes/kyc");
const cmsRoutes = require("./routes/cms");
const emailRoutes = require("./routes/email");
const ipnRoutes = require("./routes/ipn");
const categoryRoutes = require("./routes/category");
const contractRoutes = require("./routes/contract");
const galleryRoutes = require("./routes/gallery");
const usRoutes = require("./routes/us");
const ticketRoutes = require("./routes/ticket");
const faqRoutes = require("./routes/faq");
const newsLetterRoutes = require("./routes/newsLetter");
const articleRoutes = require("./routes/article");
const dashboardRoutes = require("./routes/dashboard");
const historyRoutes = require("./routes/history");
const privacyRoutes = require("./routes/privacy");
const termRoutes = require("./routes/term");
const artistRoutes = require("./routes/artist");
const taxamoRoutes = require("./routes/taxamo");
const walletRoutes = require("./routes/wallet");
const serviceRoutes = require("./routes/service");
const stripeRoutes = require("./routes/stripe");
const auctionRoutes = require("./routes/auction");
const couponRoutes = require("./routes/coupon");
const socialRoutes =  require("./routes/social")

const path = require('path');
const { removeProductKey } = require('./services/product');


const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true }));

app.use("/api/v1/stripe", stripeRoutes);
app.use(bodyParser.json({ limit: "1000mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "1000mb",
    extended: true,
    parameterLimit: 50000
  })
);
app.use(express.static("files"));
app.use("/object", express.static(__dirname + "/files/object"));
app.use(express.static("avatars"));
app.use(express.static("thumbnail"));
app.use(express.static("icon"));
app.use(express.static("sign"));
app.use(express.static("music"));
app.use(express.static("preview"));
app.use(express.static("mask_thumbnail"));
app.use(express.static("assets"));

app.use(morgan("dev"));

connectDb();

app.use("/api/v1/docs", swaggerUi.serve, (...args) =>
  swaggerUi.setup(V1Doc)(...args)
);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/transaction", transactionRoutes);
app.use("/api/v1/checkout", checkoutRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/balance", balanceRoutes);
app.use("/api/v1/kyc", kycRoutes);
app.use("/api/v1/email", emailRoutes);
app.use("/api/v1/cms", cmsRoutes);
app.use("/api/v1/us", usRoutes);
app.use("/api/v1/tickets", ticketRoutes);
app.use("/api/v1/faq", faqRoutes);
app.use("/api/v1/articles", articleRoutes);
app.use("/api/v1/artists", artistRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/histories", historyRoutes);
app.use("/api/v1/privacy", privacyRoutes);
app.use("/api/v1/term", termRoutes);
app.use("/api/v1/taxamo", taxamoRoutes);
app.use("/api/v1/wallet", walletRoutes);
app.use("/api/v1/service", serviceRoutes);
app.use("/api/v1/newsLetter", newsLetterRoutes)
app.use("/api/v1/auction", auctionRoutes)
app.use("/api/v1/coupon", couponRoutes)
app.use("/api/v1/social", socialRoutes)
app.use("/api/v2/docs", swaggerUi.serve, (...args) =>
  swaggerUi.setup(V2Doc)(...args)
);
app.use("/api/v2/contract", contractRoutes);
app.use("/api/v2/gallery", galleryRoutes);

app.use("/ipn", ipnRoutes);
app.use(async (req, res) => {
  try {
    res.status(404).send({
      status: 404,
      error: "Invalid Route Url"
    });
  } catch (error) {
    console.log("🚀 ~ file: server.js:102 ~ app.use ~ error", error)
  }
});

app.use(express.static(path.join(__dirname, 'build')));


app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

process.on("unhandledRejection", err => {
  console.log(`Error: ${err.message}`.red.bold);
  //close the server
  server.close(() => process.exit(1));
});
