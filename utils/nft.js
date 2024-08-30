const { StatusCodes } = require("http-status-codes");
const { galleryById } = require("../services/gallery");
const { createMintDoc } = require("../services/mint");
const { productById } = require("../services/product");
const { mintCsprNft } = require("./cspr");
const { mintEthNft } = require("./eth");
const { writeMetaDataFileContentForIpfs } = require("./web3Storage");
const { readWallet } = require("../services/wallet");
const { readArtistById } = require("../services/artist");
var axios = require("axios").default;

const executeNftMinting = async (products, ethereumWalletKey, casperWalletKey, userId) => {
  try {
    let newNftIds = [];
    const nftProducts = [...products];

    for (const product of nftProducts) {
      try {
        const productDoc = await productById(product.id);
        const { _id, name, description, price, currency, thumbnail, type, icon, sign, music, preview, image, galleryId, video } = productDoc;
        const gallery = await galleryById(galleryId).populate('contractId');
        const artist = await readArtistById(gallery.artistId);
        const metadata = {
          name,
          description,
          price,
          currency,
          image: `ipfs://${thumbnail?.ipfsHash}`,
          icon: `ipfs://${icon?.ipfsHash}`,
          sign: `ipfs://${sign?.ipfsHash}`,
        }
        if (type == 'song') {
          metadata.music = `ipfs://${music?.ipfsHash}`;
        }
        if (type == 'video') {
          metadata.video = `ipfs://${video?.ipfsHash}`;
        }
        if (type == 'image') {
          metadata.image_url = `ipfs://${image?.ipfsHash}`;
        }
        if (type == 'product') {
          metadata.product = productDoc.product?.ipfsHash ? productDoc.product.ipfsHash : '';
        }
        if (type == 'virtual_event') {
          metadata.video = `ipfs://${video?.ipfsHash}`;
          delete metadata.sign
        }
        const metadataIpfsHash = await writeMetaDataFileContentForIpfs(metadata);

        const mint = {
          contractId: gallery.contractId,
          userId,
          ipfsImageHash: thumbnail.ipfsHash,
          ipfsFileHash: metadataIpfsHash,
          details: {
            network: gallery.network ? gallery.network : 'testnet',
            to: '',
            chain: gallery.chain,
            transactionHash: '',
          },
          tokenId: '',
          status: false,
          artistId: gallery.artistId,
          galleryId: gallery._id,
          isMinted: false,
          productId: _id
        }
        if (mint.details.chain == "ETH") {
          let walletAddress = mint.details.chain == "ETH" && ethereumWalletKey;
          const result = await mintEthNft(gallery.contractId.contractAddress, walletAddress, thumbnail.url, artist.deploymentExecution, artist._id);
          mint.tokenId = result?.tokenId;
          mint.details.transactionHash = result.transactionHash;
          mint.details.to = walletAddress;
          mint.status = result.status;
          mint.isMinted = true;

        }
        else if (mint.details.chain == "CSPR") {
          let walletAddress = mint.details.chain == "CSPR" && casperWalletKey;
          const result = await mintCsprNft(walletAddress, gallery.contractId.contractHash, mint.ipfsImageHash, name, description, metadata, artist.deploymentExecution, artist._id)
          mint.tokenId = result?.tokenId;
          mint.details.transactionHash = result.transactionHash;
          mint.details.to = walletAddress;
          mint.status = true;
          mint.isMinted = true;
        }
        const createdNftDoc = await createMintDoc(mint);
        newNftIds.push(createdNftDoc._id);
        const wallet = await readWallet({ address: product.chain == 'CSPR' ? casperWalletKey : ethereumWalletKey })
        if (wallet) {
          wallet.nfts.push(createdNftDoc._id)
          await wallet.save();
        }
      } catch (error) {
        console.log("🚀 ~ file: nft.js:75 ~ executeNftMinting ~ error:", error)
      }
    }


    console.log("🚀 ~ file: nft.js:101 ~ executeNftMinting ~ newNftIds:", newNftIds)
    return newNftIds;
  } catch (error) {
    console.log("🚀 ~ file: nft.js:57 ~ executeNftMinting ~ error:", error)
  }
}
const getTransaction = hash => {
  try {
    var options = {
      method: "GET",
      url: `https://api-eu1.tatum.io/v3/nft/transaction/ETH/${hash}`,

      headers: {
        "Content-Type": "application/json",
        "x-testnet-type": "ethereum-rinkeby",
        "x-api-key": "607f7062-ef53-4706-9e6f-fcf2cf15002e"
      }
    };

    return axios.request(options);
  } catch (error) {
  }
};

const getUserHoldingTokenIds = hash => {
  try {
    var options = {
      method: "GET",
      // url: `https://api-eu1.tatum.io/v3/ethereum/transaction/${hash}`,
      url: `https://api-eu1.tatum.io/v3/nft/balance/ETH/0xBC577A0A2af80a79F657c1Eda09958154FC74575/0x266C2b52B9065f61274F77ca6473E3acCbd3E130`,

      headers: {
        "Content-Type": "application/json",
        "x-testnet-type": "ethereum-rinkeby",
        "x-api-key": "607f7062-ef53-4706-9e6f-fcf2cf15002e"
      }
    };

    return axios.request(options);
  } catch (error) {
  }
};

const transferToken = (to, tokenId) => {
  try {
    const data = {
      chain: "ETH",
      to,
      tokenId,
      contractAddress: process.env.NFT_CONTRACT_ADDRESS,
      tokenPrice: "0.2",
      fromPrivateKey: process.env.OWNER_PRIVATE_KEY
    };

    var options = {
      method: "POST",
      url: `https://api-eu1.tatum.io/v3/nft/transaction`,

      headers: {
        "content-type": "application/json",
        "x-testnet-type": "ethereum-rinkeby",
        "x-api-key": "607f7062-ef53-4706-9e6f-fcf2cf15002e"
      },
      data
    };

    return axios.request(options);
  } catch (error) {
  }
};

module.exports = {
  getTransaction,
  getUserHoldingTokenIds,
  transferToken,
  executeNftMinting
};
