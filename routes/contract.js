const express = require("express");

const {
  createContract,
  getAllContracts,
  getContractById,
  mintNft,
  getContractMetaData,
  transactionStatusByHash,
  transferNftOwnership,
  checkBalanceOfNftsFromAddress,
  burnNftWithTokenId,
  getAllNfts,
  removeNft
} = require("../controllers/contract");
const { check, param } = require("express-validator");

const router = express.Router();

router.post("/", validateContract("createContract"), createContract);
router.post("/mint", mintNft);
router.get("/", getAllContracts);
router.get("/artist/nfts", getAllNfts);
router.get("/metadata", getContractMetaData);
router.get("/tx/status", transactionStatusByHash);
router.get("/balance", checkBalanceOfNftsFromAddress);
router.post("/burn", burnNftWithTokenId);
router.post("/transfer/nft", transferNftOwnership);
router
    .route("/:id")
    .get(getContractById);
router.route("/artist/nft/:id").delete(removeNft);

function validateContract(route) {
  switch (route) {
    case "createContract":
      return [
        check("network")
          .notEmpty()
          .withMessage("Network required!"),
        check("chain")
          .notEmpty()
          .withMessage("Chain required!"),
        check("tokenName")
          .notEmpty()
          .withMessage("Token name required!"),
        check("tokenSymbol")
          .notEmpty()
          .withMessage("Token symbol required!"),
        check("description")
          .notEmpty()
          .withMessage("Description required!"),
      ];
    case "getContractMetaData":
      return [
        param("network")
          .isEmpty()
          .withMessage("Network required!")
      ];
    default:
      return [];
  }
}

module.exports = router;
