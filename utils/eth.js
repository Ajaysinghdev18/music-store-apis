const Web3 = require("web3");
const { abi, bytecode } = require("../constants/erc721");
const crypto = require("crypto");
let web3 = new Web3(
    new Web3.providers.HttpProvider(
        "https://sepolia.infura.io/v3/324ad4ca3a454ae7975be95a3040bc62"
    )
)
const { ethers } = require('ethers');
const { encryptDataWithPassphrase, decryptDataWithPassphrase } = require("./helpers");
const { createWalletDoc, readAllWallets } = require("../services/wallet");
const { readUser } = require("../services/user");
const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/324ad4ca3a454ae7975be95a3040bc62');

const createEthContract = async (name, symbol, mintingType, artistId) => {
    try {
        let senderAddress;
        let deploymentPrivateKey = process.env.ETHEREUM_PRIVATE_KEY_FOR_TRANSACTIONS;
        // if (mintingType == 'corporate') {
        //     deploymentPrivateKey = process.env.ETHEREUM_PRIVATE_KEY_FOR_TRANSACTIONS;
        //     senderAddress = process.env.ETHEREUM_PUBLIC_KEY_FOR_TRANSACTIONS
        // } else if (mintingType == 'custom') {
        //     const user = await readUser({ artistId })
        //     let userWallets = await readAllWallets({ userId: user._id })
        //     const ethWallet = userWallets.find((wallet) => wallet.chain == 'ETH');
        //     const binary = ethWallet.iv;
        //     const buffer = binary.buffer;
        //     const uintArray = Uint8Array.from(buffer);
        //     senderAddress = ethWallet.address;
        //     const senderPrivateKey = await decryptDataWithPassphrase(ethWallet.privateKey, uintArray);
        //     deploymentPrivateKey = senderPrivateKey;
        // }
        const contractInstance = await new web3.eth.Contract(abi);
        const deploy = await contractInstance.deploy({
            data: bytecode.object,
            arguments: [name, symbol]
        })
        // let block = await web3.eth.getBlock("latest");
        // const gas = await deploy.estimateGas();
        // console.log("🚀 ~ file: eth.js:41 ~ createEthContract ~ gas:", gas)
        // const nonce = await web3.eth.getTransactionCount(senderAddress, 'pending');
        // console.log("🚀 ~ file: eth.js:42 ~ createEthContract ~ nonce:", nonce);
        const txObject = {
            data: deploy.encodeABI(),
            // gasPrice: 20000000000,
        };
        // Connect to the Ethereum network using your private key
        const wallet = new ethers.Wallet(deploymentPrivateKey, provider);
        // Send the transaction
        console.log('-------------------- SENDING ETH TRANSACTION TO NETWORK --------------------')
        const { hash } = await wallet.sendTransaction(txObject)
        console.log("🚀 ~ file: eth.js:55 ~ createEthContract ~ hash:", hash)
        // const createTransaction = await web3.eth.accounts.signTransaction(
        //     {
        //         data: deploy.encodeABI(),
        //         gas: 1000000000,
        //         gasLimit: block.gasLimit,
        //         nonce,
        //         gasPrice: 10,
        //     },
        //     deploymentPrivateKey
        // );
        // const createReceipt = await web3.eth.sendSignedTransaction(createTransaction.rawTransaction);
        // console.log(`Contract deployed at address: ${JSON.stringify(createReceipt)}`);

        return { hash };
    } catch (error) {
        console.log("🚀 ~ file: eth.js:51 ~ createEthContract ~ error:", error)
    }
};



const getEthContractNameSymbol = async (contractAddress) => {
    try {
        const contract = await new web3.eth.Contract(abi, contractAddress);
        const name = await contract.methods.name().call();
        const symbol = await contract.methods.symbol().call();
        return { name, symbol };
    } catch (error) {
    }
};


const balanceOf = async (contractAddress, ownerAddress) => {
    try {
        const contract = await new web3.eth.Contract(abi, contractAddress);
        const balance = await contract.methods.balanceOf(ownerAddress).call();
        return { balance };
    } catch (error) {
    }
};

const transactionStatus = async (transactionHash) => {
    try {
        return web3.eth.getTransactionReceipt(transactionHash, async (err, res) => {
            if (err) {
                console.log(
                    "Something went wrong when getting status of your transaction:",
                    err
                )
            }
            if (res) {
                const tokenId = await web3.utils.hexToNumber(res.logs[0].topics[3]);
                res.tokenId = tokenId;
                return res;

            }
        })
    } catch (error) {
    }
};

const createEthWallet = async (userId) => {
    try {

        let id = crypto.randomBytes(32).toString("hex");
        let ethPrivateKey = "0x" + id;
        await encryptDataWithPassphrase(ethPrivateKey, async data => {
            try {
                let wallet = new ethers.Wallet(ethPrivateKey);
                await createWalletDoc({
                    isConnected: true,
                    default: true,
                    privateKey: data.encrypted,
                    address: wallet.address,
                    chain: "ETH",
                    userId: userId,
                    name: "Default",
                    iv: data.iv
                });
            } catch (error) {
                console.log(
                    "🚀 ~ file: auth.js:83 ~ awaitencryptDataWithPassphrase ~ error:",
                    error
                );
            }
        });
    } catch (error) {
        console.log("🚀 ~ file: helpers.js:33 ~ createCasperWal ~ error:", error)

    }

};




const mintEthNft = async (contractAddress, to, uri, mintingType, artistId) => {
    try {
        const nftContractAddress = contractAddress;
        const nftContract = new ethers.Contract(nftContractAddress, abi, provider);
        let deploymentPrivateKey = process.env.ETHEREUM_PRIVATE_KEY_FOR_TRANSACTIONS;
        // if (mintingType == 'corporate') {
        //     deploymentPrivateKey = process.env.ETHEREUM_PRIVATE_KEY_FOR_TRANSACTIONS;
        // } else if (mintingType == 'custom') {
        //     const user = await readUser({ artistId })
        //     let userWallets = await readAllWallets({ userId: user._id })
        //     const ethWallet = userWallets.find((wallet) => wallet.chain == 'ETH');
        //     const binary = ethWallet.iv;
        //     const buffer = binary.buffer;
        //     const uintArray = Uint8Array.from(buffer);
        //     const senderPrivateKey = await decryptDataWithPassphrase(ethWallet.privateKey, uintArray);
        //     deploymentPrivateKey = senderPrivateKey;
        // }


        const walletPrivateKey = deploymentPrivateKey;
        const wallet = new ethers.Wallet(walletPrivateKey, provider);
        const connectedContract = nftContract.connect(wallet);

        // Call the mint function to create a new NFT
        const mintTransaction = await connectedContract.safeMint(to, uri);

        // Wait for the transaction to be confirmed
        const transaciton = await mintTransaction.wait();

        const { transactionHash, status, tokenId } = await transactionStatus(transaciton.hash);
        console.log("🚀 ~ file: eth.js:105 ~ mintEthNft ~ transactionHash:", transactionHash)
        return { transactionHash, status, tokenId };
        // const contract = await new web3.eth.Contract(abi, contractAddress);
        // let nonce = await web3.eth.getTransactionCount("0xE9ADEac17Cd95133d9B497DdDb4916B42075F91e", 'latest'); //get latest nonce
        // let nonce1 = await web3.eth.getTransactionCount("0xE9ADEac17Cd95133d9B497DdDb4916B42075F91e", 'pending'); //get latest nonce
        // // throw new Error('sss')
        // let block = await web3.eth.getBlock("latest");
        // let estimatedGas = await web3.eth.getGasPrice();
        // let increasedGasPrice = estimatedGas * 3;
        // //the transaction
        // const tx = {
        //     from: "0xE9ADEac17Cd95133d9B497DdDb4916B42075F91e",
        //     to: contractAddress,
        //     nonce: nonce1,
        //     gas: 30000,
        //     gasLimit: block.gasLimit,
        //     data: contract.methods.safeMint(to, uri).encodeABI(),
        // };
        // const signTransaction = await web3.eth.accounts.signTransaction(tx, "0xdf9c9164bf2bde6023c225ed35826f396ceeba8540106c8c173087a5aafb6e60")
        // const data = await web3.eth.sendSignedTransaction(
        //     signTransaction.rawTransaction
        // )
        // const { transactionHash, status } = data;
        // return { transactionHash, status, tokenId, estimatedGas };
    } catch (error) {
        console.log("🚀 ~ file: eth.js:136 ~ mintEthNft ~ error:", error)
    }
};


const safeTransferNft = async (contractAddress = "0x104847F974f6c607cf83ccC42A7bdaD0201ba79F", from = "0x0eb473179e063595f6075E732d5F188c041acB94", tokenId = "11", to = "0xfB0CE5080C45224b19B8BF25Ee89105e35900a35") => {
    try {
        const nftContractAddress = contractAddress;
        const nftContract = new ethers.Contract(nftContractAddress, abi, provider);
        let deploymentPrivateKey = process.env.ETHEREUM_PRIVATE_KEY_FOR_TRANSACTIONS;

        const walletPrivateKey = deploymentPrivateKey;
        const wallet = new ethers.Wallet(walletPrivateKey, provider);
        const connectedContract = nftContract.connect(wallet);

        // Call the mint function to create a new NFT
        const safeTransferNft = await connectedContract.transferFrom(process.env.ETHEREUM_PUBLIC_KEY_FOR_TRANSACTIONS, to, "11");
        console.log("🚀 ~ file: eth.js:221 ~ safeTransferNft ~ safeTransferNft:", safeTransferNft)

        // Wait for the transaction to be confirmed
        const transaciton = await safeTransferNft.wait();
        console.log("🚀 ~ file: eth.js:225 ~ safeTransferNft ~ transaciton:", transaciton)

        const { transactionHash, status, tokenId } = await transactionStatus(transaciton.hash);
        console.log("🚀 ~ file: eth.js:105 ~ mintEthNft ~ transactionHash:", transactionHash);
        return { transactionHash, status, tokenId };
        // const contract = await new web3.eth.Contract(abi, contractAddress);
        // let nonce = await web3.eth.getTransactionCount(process.env.ETHEREUM_PUBLIC_KEY_FOR_TRANSACTIONS, 'pending'); //get latest nonce
        // let block = await web3.eth.getBlock("latest");
        // const tx = {
        //     from: process.env.ETHEREUM_PUBLIC_KEY_FOR_TRANSACTIONS,
        //     to: contractAddress,
        //     nonce,
        //     gas: 30000,
        //     gasLimit: block.gasLimit,
        //     data: contract.methods.safeTransferFrom(process.env.ETHEREUM_PUBLIC_KEY_FOR_TRANSACTIONS, to, tokenId).encodeABI()
        // };
        // const signTransaction = await web3.eth.accounts.signTransaction(tx, process.env.ETHEREUM_PRIVATE_KEY_FOR_TRANSACTIONS)
        // const data = await web3.eth.sendSignedTransaction(
        //     signTransaction.rawTransaction
        // )
        // return data;
    } catch (error) {
        console.log("🚀 ~ file: eth.js:228 ~ safeTransferNft ~ error:", error)
    }
};


const burnNft = async (contractAddress, tokenId) => {
    try {
        const contract = await new web3.eth.Contract(abi, contractAddress);
        let nonce = await web3.eth.getTransactionCount(process.env.ETHEREUM_PUBLIC_KEY_FOR_TRANSACTIONS, 'latest'); //get latest nonce
        let block = await web3.eth.getBlock("latest");
        const tx = {
            from: process.env.ETHEREUM_PUBLIC_KEY_FOR_TRANSACTIONS,
            to: contractAddress,
            nonce,
            gas: 30000,
            gasLimit: block.gasLimit,
            data: contract.methods.burn(tokenId).encodeABI()
        };
        const signTransaction = await web3.eth.accounts.signTransaction(tx, process.env.ETHEREUM_PRIVATE_KEY_FOR_TRANSACTIONS)
        const data = await web3.eth.sendSignedTransaction(
            signTransaction.rawTransaction
        )
        return data;
    } catch (error) {
    }
};


const checkEthTxHash = (hash) => /^0x([A-Fa-f0-9]{64})$/.test(hash);
module.exports = { balanceOf, createEthWallet, createEthContract, getEthContractNameSymbol, mintEthNft, transactionStatus, safeTransferNft, burnNft, checkEthTxHash }