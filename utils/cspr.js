const fs = require("fs");
const path = require("path");
const { Keys, CasperClient, Contracts, CasperServiceByJsonRPC,
  DeployUtil,
  RuntimeArgs,
  CLKey,
  CLPublicKey,
  CLAccountHash,
  CLValueBuilder } = require("casper-js-sdk");
const { config } = require("dotenv");
const { parseTokenMeta, encryptDataWithPassphrase, decryptDataWithPassphrase } = require("./helpers");
const { StatusCodes } = require("http-status-codes");
const { createWalletDoc, readAllWallets } = require("../services/wallet");
const { readUser } = require("../services/user");
const { CEP78Client } = require("casper-cep78-js-client");
config({ path: ".env" });


const {
  CSPR_NODE_ADDRESS,
  CSPR_CHAIN,
  WASM_PATH,
  MASTER_KEY_PAIR_PATH,
  INSTALL_CONTRACT_PAYMENT_AMOUNT,
  TRANSFER_NFT_PAYMENT_AMOUNT,
  INSTALL_NFT_PAYMENT_AMOUNT
} = process.env;
const getBinary = (pathToBinary) => {
  return new Uint8Array(fs.readFileSync(pathToBinary, null).buffer);
};

const KEYS = Keys.Ed25519.parseKeyFiles(
  `${MASTER_KEY_PAIR_PATH}/public_key.pem`,
  `${MASTER_KEY_PAIR_PATH}/secret_key.pem`
);

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const getDeploy = async (NODE_URL, deployHash, contractName, sucessCb = () => { }) => {
  const client = new CasperClient(NODE_URL);
  let i = 100;
  return new Promise(async (resolve, reject) => {
    while (i != 0) {
      const [deploy, raw] = await client.getDeploy(deployHash);
      if (raw.execution_results.length !== 0) {
        if (raw.execution_results[0].result.Success) {
          let result;
          if (contractName) {
            let accountInfo = await getAccountInfo(CSPR_NODE_ADDRESS, KEYS.publicKey);
            const contractHash = await getAccountNamedKeyValue(
              accountInfo,
              `cep78_contract_hash_${contractName}`,
            );
            result = {
              contractHash,
              ...deploy
            }
          } else {
            result = {
              ...deploy
            }
          }
          resolve(result);
          sucessCb();
          break;
        } else {
          reject(`Contract execution: ` + raw.execution_results[0].result.Failure.error_message);
        }
      } else {
        i--;
        await sleep(3000);
        continue;
      }
    }
    reject('Request timeout [getDeploy]')
  })
};

const getAccountInfo = async (
  nodeAddress,
  publicKey
) => {
  const client = new CasperServiceByJsonRPC(nodeAddress);
  const stateRootHash = await client.getStateRootHash();
  const accountHash = publicKey.toAccountHashStr();
  const blockState = await client.getBlockState(stateRootHash, accountHash, []);
  return blockState.Account;
};

const getCsprAccountBalance = async (
  publicKey
) => {
  try {

    const apiUrl = process.env.CSPR_NODE_ADDRESS;
    const casperService = new CasperServiceByJsonRPC(apiUrl);
    const latestBlock = await casperService.getLatestBlockInfo();
    const root = await casperService.getStateRootHash();
    const balanceUref = await casperService.getAccountBalanceUrefByPublicKey(
      root,
      CLPublicKey.fromHex(publicKey)
    );
    const balance = await casperService.getAccountBalance(
      latestBlock.block.header.state_root_hash,
      balanceUref
    );
    return balance;
  } catch (error) {
    console.log("🚀 ~ file: cspr.js:112 ~ error:", error)
    return 0;
  }
};


const getAccountNamedKeyValue = (accountInfo, namedKey) => {
  const found = accountInfo.namedKeys.find((i) => i.name === namedKey);
  if (found) {
    return found.key;
  }
  return undefined;
};

const deployCsprContract = async (tokenSymbol, contractName, mintingType, artistId) => {
  try {

    const client = new CasperClient(CSPR_NODE_ADDRESS)
    const contract = new Contracts.Contract(client);
    const schema = {
      "properties": {
        "first_name": {
          "name": "First Name",
          "description": "Token holder's first name",
          "required": true
        },
        "last_name": {
          "name": "Last Name",
          "description": "Token holder's last name",
          "required": true
        }
      }
    }
    const args = RuntimeArgs.fromMap({
      collection_name: CLValueBuilder.string(contractName),
      collection_symbol: CLValueBuilder.string(tokenSymbol),
      total_token_supply: CLValueBuilder.u64(1000),
      ownership_mode: CLValueBuilder.u8(2), // Transferable
      nft_kind: CLValueBuilder.u8(1), // Digital
      holder_mode: CLValueBuilder.u8(2), // Holdable by Accounts & Contracts
      whitelist_mode: CLValueBuilder.u8(0), // Unlocked
      minting_mode: CLValueBuilder.u8(1), // Public
      nft_metadata_kind: CLValueBuilder.u8(2), // Raw metadata
      identifier_mode: CLValueBuilder.u8(0), // Ordinal
      metadata_mutability: CLValueBuilder.u8(0), // Immutable
      burn_mode: CLValueBuilder.u8(0), // Burnable
      json_schema: CLValueBuilder.string(JSON.stringify(schema)), // Empty JSON Schema,
      events_mode: CLValueBuilder.u8(2), // Immutable
    })
    let DeploymentKeys = KEYS;
    // if (mintingType == 'corporate') {
    //   DeploymentKeys = KEYS;
    // } else if (mintingType == 'custom') {
    //   const user = await readUser({ artistId })
    //   const wallets = await readAllWallets({ userId: user._id })
    //   const casperWallet = wallets.find((wallet) => wallet.chain == 'CSPR');
    //   const binary = casperWallet.iv;
    //   const buffer = binary.buffer;
    //   const uintArray = Uint8Array.from(buffer);
    //   const folder = path.join("./files/", "casper_keys");
    //   const decrypt = await decryptDataWithPassphrase(casperWallet.privateKey, uintArray)
    //   fs.writeFileSync(folder + "/" + casperWallet.address + "_public_key.pem", casperWallet.publicKey);
    //   fs.writeFileSync(folder + "/" + casperWallet.address + "_secret_key.pem", decrypt);
    //   DeploymentKeys = Keys.Ed25519.parseKeyFiles(
    //     `${folder + "/" + casperWallet.address}_public_key.pem`,
    //     `${folder + "/" + casperWallet.address}_secret_key.pem`
    //   );
    // }
    console.log("🚀 ~ file: cspr.js:189 ~ deployCsprContract ~ INSTALL_CONTRACT_PAYMENT_AMOUNT:", INSTALL_CONTRACT_PAYMENT_AMOUNT);
    const installDeploy = await contract.install(
      getBinary(WASM_PATH),
      args,
      INSTALL_CONTRACT_PAYMENT_AMOUNT,
      DeploymentKeys.publicKey,
      CSPR_CHAIN,
      [DeploymentKeys]
    );
    const hash = await installDeploy.send(CSPR_NODE_ADDRESS);


    console.log(`... Contract installation deployHash: ${hash}`);

    const accountInfo = await getAccountInfo(
      CSPR_NODE_ADDRESS,
      DeploymentKeys.publicKey
    );

    return { accountInfo, transactionHash: hash };
  } catch (error) {
    return error,
    console.log("🚀 ~ file: cspr.js:176 ~ deployCsprContract ~ error", error)
  }
}
const createAccountKeys = () => {
  // Generating keys
  const edKeyPair = Keys.Ed25519.new();
  const { publicKey, privateKey } = edKeyPair;

  // Get account-address from public key
  const accountAddress = publicKey.toHex();

  // Get account-hash (Uint8Array) from public key
  // const accountHash = publicKey.toAccountHash();

  // Store keys as PEM files
  const publicKeyInPem = edKeyPair.exportPublicKeyInPem();
  const privateKeyInPem = edKeyPair.exportPrivateKeyInPem();

  const folder = path.join("./files/", "casper_keys");

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  fs.writeFileSync(folder + "/" + accountAddress + "_public.pem", publicKeyInPem);
  fs.writeFileSync(folder + "/" + accountAddress + "_private.pem", privateKeyInPem);

  return { privateKeyPath: folder + "/" + accountAddress + "_private.pem", publicKeyPath: folder + "/" + accountAddress + "_public.pem", accountAddress };
};

const createCasperWallet = async (userId) => {
  console.log("🚀 ~ file: cspr.js:238 ~ createCasperWal ~ userId:", userId)
  try {
    const Keys = createAccountKeys();
    console.log("🚀 ~ file: cspr.js:240 ~ createCasperWal ~ Keys:", Keys)
    const privateKeyData = fs
      .readFileSync(Keys.privateKeyPath, "utf8")
      .toString();
    const publicKeyData = fs
      .readFileSync(Keys.publicKeyPath, "utf8")
      .toString();

    await encryptDataWithPassphrase(privateKeyData, async data => {
      console.log("🚀 ~ file: cspr.js:250 ~ createCasperWal ~ data:", data)
      await createWalletDoc({
        isConnected: true,
        default: true,
        privateKey: data.encrypted,
        address: Keys.accountAddress,
        publicKey: publicKeyData,
        chain: "CSPR",
        userId: userId,
        name: "Default",
        iv: data.iv
      });
      return Keys;
    });
  } catch (error) {
    console.log("🚀 ~ file: helpers.js:33 ~ createCasperWal ~ error:", error)

  }

};


const getCsprMetaDetaOfContract = async (contractAddress) => {
  try {
    const client = new CasperClient(CSPR_NODE_ADDRESS);
    const contract = new Contracts.Contract(client);
    contract.setContractHash(contractAddress, undefined);
    const name = await contract.queryContractData(['name'])
    const symbol = await contract.queryContractData(['symbol'])
    return {
      name,
      symbol,
    }
  } catch (error) {
    console.log("🚀 ~ file: cspr.js ~ line 36 ~ getCsprMetaDetaOfContract ~ error", error)

  }
}


const getCsprDeployStatus = async (deployHash) => {
  const client = new CasperClient(CSPR_NODE_ADDRESS);
  let i = 300;
  while (i != 0) {
    const [deploy, raw] = await client.getDeploy(deployHash);
    if (raw.execution_results.length !== 0) {
      // @ts-ignore
      if (raw.execution_results[0].result.Success) {
        return deploy;
      } else {
        // @ts-ignore
        throw Error(
          "Contract execution: " +
          // @ts-ignore
          raw.execution_results[0].result.Failure.error_message
        );
      }
    } else {
      i--;
      await sleep(1000);
      continue;
    }
  }
  throw Error("Timeout after " + i + "s. Something's wrong");
};

const mintCsprNft = async (publicKey, contractAddress, uri, name, description, metadata, mintingType, artistId) => {
  try {
    const client = new CasperClient(CSPR_NODE_ADDRESS)
    const contract = new Contracts.Contract(client)
    await contract.setContractHash(contractAddress);

    console.log(`\n=====================================\n`);

    const allowMintingSetting = await contract.queryContractData(["allow_minting"]);
    console.log(`AllowMintingSetting: ${allowMintingSetting}`);

    const burnModeSetting = await contract.queryContractData([
      "burn_mode",
    ]);
    console.log(`BurnModeSetting: ${burnModeSetting}`);

    const identifierModeSetting = await contract.queryContractData([
      "identifier_mode",
    ]);
    const number_of_minted_tokens = await contract.queryContractData([
      "number_of_minted_tokens",
    ]);
    let tokenId = parseInt(number_of_minted_tokens);
    console.log("🚀 ~ file: cspr.js:295 ~ mintCsprNft ~ tokenId:", tokenId)
    const holderModeSetting = await contract.queryContractData([
      "json_schema",
    ]);
    console.log(`HolderModeSetting: ${holderModeSetting}`);

    console.log(`IdentifierModeSetting: ${identifierModeSetting}`);

    const hashAccount = new CLAccountHash(
      CLPublicKey.fromHex(publicKey).toAccountHash()
    );

    const TOKEN_OWNER = new CLKey(hashAccount);
    const runtimeArgs = RuntimeArgs.fromMap({
      token_owner: TOKEN_OWNER,
      token_meta_data: CLValueBuilder.string(JSON.stringify(
        metadata
      )),
    });

    let DeploymentKeys = KEYS;
    // if (mintingType == 'corporate') {
    //   DeploymentKeys = KEYS;
    // } else if (mintingType == 'custom') {
    //   const user = await readUser({ artistId })
    //   const wallets = await readAllWallets({ userId: user._id })
    //   const casperWallet = wallets.find((wallet) => wallet.chain == 'CSPR');
    //   const binary = casperWallet.iv;
    //   const buffer = binary.buffer;
    //   const uintArray = Uint8Array.from(buffer);
    //   const folder = path.join("./files/", "casper_keys");
    //   const decrypt = await decryptDataWithPassphrase(casperWallet.privateKey, uintArray)
    //   fs.writeFileSync(folder + "/" + casperWallet.address + "_public_key.pem", casperWallet.publicKey);
    //   fs.writeFileSync(folder + "/" + casperWallet.address + "_secret_key.pem", decrypt);
    //   DeploymentKeys = Keys.Ed25519.parseKeyFiles(
    //     `${folder + "/" + casperWallet.address}_public_key.pem`,
    //     `${folder + "/" + casperWallet.address}_secret_key.pem`
    //   );
    // }

    const deploy = contract.callEntrypoint(
      "mint",
      runtimeArgs,
      DeploymentKeys.publicKey,
      CSPR_CHAIN,
      INSTALL_NFT_PAYMENT_AMOUNT,
      [DeploymentKeys]
    );
    const deployHash = await deploy.send(CSPR_NODE_ADDRESS);
    console.log("🚀 ~ file: cspr.js:335 ~ mintCsprNft ~ deployHash, tokenId:", deployHash, tokenId)
    return { transactionHash: deployHash, tokenId };
  } catch (error) {
    console.log("🚀 ~ file: cspr.js:238 ~ mintCsprNft ~ error", error.message)
    if (error.code == -32008) {
      throw new Error(error.data);
    }
  }
}

const transferCsprTokenByTokenId = async (contractHash, tokenId, to, artistId) => {
  try {
    const cep78 = new CEP78Client(
      CSPR_NODE_ADDRESS,
      CSPR_CHAIN
    );
    await cep78.setContractHash(contractHash);

    let tokenOwner = await cep78.getOwnerOf(tokenId);
    console.log(`...... Owner of token ${tokenId} is ${tokenOwner}`);
    const recipient = CLPublicKey.fromHex(to);

    const user = await readUser({ artistId })
    const wallets = await readAllWallets({ userId: user._id })
    const casperWallet = wallets.find((wallet) => wallet.chain == 'CSPR');
    const binary = casperWallet.iv;
    const buffer = binary.buffer;
    const uintArray = Uint8Array.from(buffer);
    const folder = path.join("./files/", "casper_keys");
    const decrypt = await decryptDataWithPassphrase(casperWallet.privateKey, uintArray)
    fs.writeFileSync(folder + "/" + casperWallet.address + "_public_key.pem", casperWallet.publicKey);
    fs.writeFileSync(folder + "/" + casperWallet.address + "_secret_key.pem", decrypt);
    const DeploymentKeys = Keys.Ed25519.parseKeyFiles(
      `${folder + "/" + casperWallet.address}_public_key.pem`,
      `${folder + "/" + casperWallet.address}_secret_key.pem`
    );

    const transferOneDeploy = await cep78.transfer({
      tokenId,
      source: DeploymentKeys.publicKey,
      target: recipient,
    },
      { useSessionCode: false },
      TRANSFER_NFT_PAYMENT_AMOUNT,
      DeploymentKeys.publicKey,
      [DeploymentKeys]);

    console.log(`...... Transfer from ${DeploymentKeys.publicKey.toAccountHashStr()} to ${recipient.toAccountHashStr()}`);

    const transferOneHash = await transferOneDeploy.send(CSPR_NODE_ADDRESS);

    console.log("...... Transfer deploy hash: ", transferOneHash);
  } catch (error) {
    console.log("🚀 ~ file: cspr.js:250 ~ transferCsprTokenByTokenId ~ error", error)

  }
}

const sendTransfer = async ({ to, amount }, path, res) => {
  try {
    const casperClient = new CasperClient(CSPR_NODE_ADDRESS);
    // Casper Decimals
    const casperDecimals = 1000000000;
    // read keys from structure created in #Generating keys
    let signKeyPair = undefined;
    if (path?.publicKeyPath) {
      signKeyPair = Keys.Ed25519.parseKeyFiles(
        path.publicKeyPath,
        path.privateKeyPath
      );
    } else {
      signKeyPair = Keys.Ed25519.parseKeyFiles(
        `${MASTER_KEY_PAIR_PATH}/public_key.pem`,
        `${MASTER_KEY_PAIR_PATH}/secret_key.pem`
      );
    }

    let networkName = CSPR_CHAIN;
    // for native-transfers payment price is fixed
    let paymentAmount = 0.1 * casperDecimals;
    let amountToSend = amount * casperDecimals;
    // transfer_id field in the request to tag the transaction and to correlate it to your back-end storage
    const id = 187821;
    // gas price for native transfers can be set to 1
    const gasPrice = 1;
    // time that the Deploy will remain valid for, in milliseconds, the default value is 1800000, which is 30 minutes
    const ttl = 1800000;

    let deployParams = new DeployUtil.DeployParams(
      signKeyPair.publicKey,
      networkName,
      ttl
    );
    // we create public key from account-address (in fact it is hex representation of public-key with added prefix)
    const toPublicKey = CLPublicKey.fromHex(to);

    const session = DeployUtil.ExecutableDeployItem.newTransfer(
      amountToSend,
      toPublicKey,
      null,
      id
    );
    const payment = DeployUtil.standardPayment(paymentAmount);
    const deploy = DeployUtil.makeDeploy(deployParams, session, payment);
    const signedDeploy = DeployUtil.signDeploy(deploy, signKeyPair);
    // we are sending the signed deploy
    const hash = await casperClient.putDeploy(signedDeploy);
    return hash;
  } catch (error) {
    console.log("🚀 ~ file: cspr.js:413 ~ sendTransfer ~ error:", error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error });
  }
};

module.exports = {
  createAccountKeys,
  getCsprMetaDetaOfContract,
  mintCsprNft,
  deployCsprContract,
  getCsprDeployStatus,
  transferCsprTokenByTokenId,
  getDeploy,
  sleep,
  sendTransfer,
  getCsprAccountBalance,
  createCasperWallet,
}