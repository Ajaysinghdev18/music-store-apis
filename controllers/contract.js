const { StatusCodes } = require("http-status-codes");
const { validationResult } = require("express-validator");
const { sendUserAndEmailValueNotification, getByEmailTypeEmailTemplates } = require("../services/email")
const {
  createContractDoc,
  allContracts,
  contractById,
  updateContractDoc,
  allNfts,
  removeNftService,
} = require("../services/contract");
const Web3 = require("web3");
const { createEthContract, mintEthNft, getEthContractNameSymbol, transactionStatus, safeTransferNft, balanceOf, burnNft } = require("../utils/eth");
const { getCsprMetaDetaOfContract, mintCsprNft, deployCsprContract, transferCsprTokenByTokenId, getDeploy } = require("../utils/cspr");
const { createMintDoc } = require("../services/mint");
const { readArtistById } = require("../services/artist");
const { checkForValidMongoDbID, sleep } = require("../utils/helpers");
const fs = require('fs');
let web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://sepolia.infura.io/v3/324ad4ca3a454ae7975be95a3040bc62"
  )
)


const createContract = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, errors: errors.array() });
    }

    const { tokenName, tokenSymbol, network, chain, contractName, description, artistId } = req.body;
  
    let contract = {
      contractAddress: '',
      contractHash: '',
      contractName,
      tokenName,
      tokenSymbol,
      description,
      details: {
        network,
        chain,
        gasUsed: '',
        from: '',
        transactionHash: '',
      },
      status: 'pending',
      artistId: ''
    }
    const artist = await readArtistById(artistId);
    if (!artist) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: 'Artist Nor Found'
      });
    }
    if (network == "testnet" && chain == "ETH") {
      const { hash } = await createEthContract(tokenName, tokenSymbol, artist.deploymentExecution, artistId);
      // contract.contractAddress = result.createReceipt.contractAddress;
      contract.details.transactionHash = hash;
      contract.status = 'pending';
      // contract.details.gasUsed = result.createReceipt.gasUsed;
      // contract.details.from = result.createReceipt.from;
      contract.contractHash = null;

    }
    else if (network == "testnet" && chain == "CSPR") {

      const { transactionHash } = await deployCsprContract(tokenSymbol, contractName, artist.deploymentExecution, artistId);

      contract.details.transactionHash = transactionHash;
      contract.contractAddress = null;
      contract.details.gasUsed = null;


      const fromKey = await fs.readFileSync(process.env.MASTER_KEY_PAIR_PATH + '/public_key_hex', 'utf8')
      contract.details.from = fromKey;
      getDeploy(process.env.CSPR_NODE_ADDRESS, transactionHash, contractName)
        .then(async (res) => {
          await updateContractDoc({ 'details.transactionHash': transactionHash }, { contractHash: res.contractHash, status: 'succeed' })
        })
        .catch(async (err) => {
          console.log("🚀 ~ file: contract.js:66 ~ createContract ~ err", err);
          if (err.includes('Mint error')) {
            await updateContractDoc({ 'details.transactionHash': transactionHash }, { error: err, status: 'low casper balance' })
          }
        })
    }
    contract.artistId = artistId;
    const newContract = await createContractDoc(contract);
    if (chain == 'ETH') {
      let i = 15;
      let checkTransactionsStatus = new Promise(async (resolve, reject) => {
        while (i != 0) {
          const transaction = await web3.eth.getTransactionReceipt(newContract.details.transactionHash);
          if (transaction?.status) {
            if (transaction?.status) {
              console.log("🚀 ~ file: payment.js:167 ~ checkTransactionsStatus ~ transaction:", transaction)
              await updateContractDoc({ _id: newContract._id }, { status: 'succeed', contractAddress: transaction.contractAddress, 'details.gasUsed': transaction.gasUsed, 'details.from': transaction.from })
              resolve('Success!');
              break;
            } else {
              reject(`Contract execution: ` + '=========> FAILLLLEEEEEEEEDDDDDD <=========');
            }
          } else {
            i--;
            await sleep(5000);
            continue;
          }
        }
        reject('Request timeout [getDeploy]')
      })
      checkTransactionsStatus.then((data) => {
        console.log("🚀 ~ file: contract.js:93 ~ checkTransactionsStatus ~ data:", data)
      })
        .catch(err => {
          console.log("🚀 ~ file: contract.js:97 ~ createContract ~ err:", err)

        })
    }
    const template = await getByEmailTypeEmailTemplates('new_smart_contract')

    if (template) {
      await sendUserAndEmailValueNotification(artist, template);
    }

    res.status(StatusCodes.CREATED).json({
      success: true,
      msg: "Contract created!",
      data: contract
    });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const mintNft = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, errors: errors.array() });
    }
    const { contractId, uri, network, chain } = req.body;
    const contract = await contractById(contractId);
    const mint = {
      contractId,
      uri,
      details: {
        network,
        to: '',
        chain,
        transactionHash: '',
      },
      tokenId: '',
      status: false
    }
    if (!contract) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, msg: 'Invalid Contract' })
    }
    if (network == "testnet" && chain == "ETH") {
      const result = await mintEthNft(contract.contractAddress, process.env.ETHEREUM_PUBLIC_KEY_FOR_TRANSACTIONS, uri);
      console.log("🚀 ~ file: contract.js:126 ~ mintNft ~ result", result)
      mint.tokenId = result.tokenId;
      mint.details.transactionHash = result.transactionHash;
      mint.details.to = process.env.ETHEREUM_PUBLIC_KEY_FOR_TRANSACTIONS;
      mint.status = result.status
    }
    else if (network == "testnet" && chain == "CSPR") {
      const result = await mintCsprNft(contractId, contract.contractHash, uri)
      mint.tokenId = result.tokenId;
      mint.details.transactionHash = result.transactionHash;
      mint.details.to = process.env.CASPER_PUBLIC_KEY;
    }

    await createMintDoc(mint);
    res.status(StatusCodes.OK).json({
      success: true,
      transaction: mint
    });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const checkBalanceOfNftsFromAddress = async (req, res) => {
  try {
    const { ownerAddress, contractAddress } = req.query;
    const data = await balanceOf(contractAddress, ownerAddress);
    res.status(StatusCodes.OK).json({
      success: true,
      data
    });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const transactionStatusByHash = async (req, res) => {
  try {
    const { transactionHash, chain, network } = req.query;
    let result;
    if (network == "test-net" && chain == "ETH") {
      result = await transactionStatus(transactionHash);
    }
    else if (network == "test-net" && chain == "CSPR") {
      result = await getDeploy(process.env.CSPR_NODE_ADDRESS, transactionHash)
    }
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const transferNftOwnership = async (req, res) => {
  try {

    const { contractId, to, tokenId, network, chain } = req.body;
    const contract = await contractById(contractId);
    const { contractAddress, contractHash } = contract;
    if (!contract) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, msg: 'Invalid Contract' })
    }
    if (network == "testnet" && chain == "ETH") {
      const result = await safeTransferNft(contractAddress, from, tokenId, to);

    }
    else if (network == "testnet" && chain == "CSPR") {
      const result = await transferCsprTokenByTokenId(contractHash, tokenId, to)
      mint.tokenId = result.tokenId;
      mint.details.transactionHash = result.transactionHash;
      mint.details.to = process.env.CASPER_PUBLIC_KEY;
    }


    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};


const burnNftWithTokenId = async (req, res) => {
  try {
    const { contractAddress, tokenId } = req.body;
    const data = await burnNft(contractAddress, tokenId);
    res.status(StatusCodes.OK).json({
      success: true,
      data
    });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const removeNft = async (req, res) => {
  try {
    const id = req.params.id;
    await removeNftService(id);

    res.status(StatusCodes.OK).json({ success: true });
  } catch (err) {
    console.log(
      "🚀 ~ file: controllers / user.js ~ line 98 ~ remove ~ err",
      err
    );
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const getContractMetaData = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, errors: errors.array() });
    }
    const { contractAddress, contractHash, chain, network } = req.query;
    let result;
    if (network == "testnet" && chain == "ETH") {
      result = await getEthContractNameSymbol(contractAddress);
    }
    else if (network == "testnet" && chain == "CSPR") {
      result = await getCsprMetaDetaOfContract(contractAddress)
    }
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const getAllContracts = async (req, res) => {
  try {
    let { query, projection, options } = req.query;

    let newQuery = {};
    if (query) {
      query = JSON.parse(query);
      Object.entries(query).map(([key, value]) => {
        if (typeof value === "string") {
          newQuery[key] = value;
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

    const contracts = await allContracts(newQuery, projection, options);

    const all = await allContracts(newQuery);

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

    res.status(StatusCodes.OK).json({ success: true, contracts, pagination });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const getContractById = async (req, res) => {
  try {
    const id = req.params.id;

    if (!checkForValidMongoDbID.test(id)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, msg: "Invalid Id" });
    }
    const contract = await contractById(id);

    if (!contract) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, msg: "Not Found" });
    }

    res.status(StatusCodes.OK).json({ success: true, contract });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const getAllNfts = async (req, res) => {
  try {
    let { query, projection, options } = req.query;

    let newQuery = {};
    if (query) {
      query = JSON.parse(query);
      Object.entries(query).map(([key, value]) => {
        newQuery[key] = value;
      });
    }
    if (projection) {
      projection = JSON.parse(projection);
    }
    if (options) {
      options = JSON.parse(options);
    }

    const nfts = await allNfts(newQuery, projection, options).populate('productId', 'name');

    const all = await allNfts(newQuery);

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
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};


module.exports = {
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
};
