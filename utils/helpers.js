const { CasperClient, CLPublicKey, Keys, CasperServiceByJsonRPC } = require("casper-js-sdk");
const crypto = require('crypto');
const fs = require('fs')

const readFileContent = (path) => {
  fs.readFileSync(path, { encoding: 'utf-8' }, function (err, data) {
    if (!err) {
      return data;
    } else {
      console.log(err);
    }
  });
}

const checkForValidMongoDbID = new RegExp("^[0-9a-fA-F]{24}$");

const parseTokenMeta = (str) =>
  str.split(",").map((s) => {
    const map = s.split(" ");

    return [map[0], map[1]];
  });

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};


const getKeyPairOfUserSet = (pathToUsers) => {
  return [1, 2, 3, 4, 5].map((userID) => {
    return Keys.Ed25519.parseKeyFiles(
      `${pathToUsers}/user-${userID}/public_key.pem`,
      `${pathToUsers}/user-${userID}/secret_key.pem`
    );
  });
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

const getAccountNamedKeyValue = (accountInfo, namedKey) => {
  const found = accountInfo.namedKeys.find((i) => i.name === namedKey);
  if (found) {
    return found.key;
  }
  return undefined;
};

const makeHistoryContent = (
  whoAction = '',
  whoActionSuffix = '',
  howAction = '',
  howActionSuffix = '',
  withWhat = '',
  withWhatSuffix = '',
) => {
  return {
    defaultColor: getColorByAction(howAction),
    whoAction: {
      value: whoAction,
      color: 'warning'
    },
    whoActionSuffix: {
      value: whoActionSuffix,
    },
    howAction: {
      value: howAction,
      color: howAction === 'deleted' ? 'error' : ''
    },
    howActionSuffix: {
      value: howActionSuffix,
    },
    withWhat: {
      value: withWhat,
      color: getColorByAction(howAction)
    },
    withWhatSuffix: {
      value: withWhatSuffix,
      color: 'warning'
    }
  };
};

const getColorByAction = (action) => {
  let color;

  switch (action) {
    case 'disfeatured':
    case 'deleted':
    case 'reseted':
      color = 'error';
      break;
    case 'draft':
      color = 'info';
      break;
    case 'created':
    case 'featured':
    case 'verified':
    case 'published':
    case 'updated':
      color = 'success';
      break;
    case 'unverified':
    case 'unpublished':
      color = 'warning';
      break;
    default:
      color = 'success';
      break;
  }
  return color;
};

const encryptDataWithPassphrase = (text, cb) => {
  const algorithm = "aes-192-cbc";
  try {
    //generate encryption key using the secret.
    crypto.scrypt(process.env.JWT_SECRET, 'salt', 24, (err, key) => {
      if (err) throw err;
      //create an initialization vector
      crypto.randomFill(new Uint8Array(16), (err, iv) => {
        if (err) throw err;
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = '';
        cipher.setEncoding('hex');
        cipher.on('data', (chunk) => encrypted += chunk);
        cipher.on('end', () => cb({ encrypted, iv }))
        cipher.on('error', (err) => console.log(err))
        cipher.write(text);
        cipher.end();
      });
    });
  } catch (error) {
    console.log("🚀 ~ file: helpers.js:125 ~ encryptData ~ error:", error)

  }
}

const decryptDataWithPassphrase = (data, iv) => {
  return new Promise((resolve, reject) => {
    const algorithm = "aes-192-cbc";
    //generate encryption key using secret
    crypto.scrypt(process.env.JWT_SECRET, 'salt', 24, (err, key) => {
      if (err) {
        console.log("🚀 ~ file: helpers.js:154 ~ crypto.scrypt ~ err:", err)
        throw err
      };
      //create decipher object
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = '';
      decipher.on('readable', () => {
        while (null !== (chunk = decipher.read())) {
          decrypted += chunk.toString('utf8');
        }
      });
      decipher.on('end', () => resolve(decrypted));
      decipher.on('error', (err) => reject(err))
      decipher.write(data, 'hex');
      decipher.end();
    })
  })
}

const addDaysToDate = (theDate, days) => {
  return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
}


const findHighestNumber = (array) => {
  let largest = 0;
  for (let i = 0; i < array.length; i++) {
    if (array[i] > largest) {
      largest = array[i];
    }
  }
  return largest;
}


const generateCouponCode = () => {
  let code = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // Alphanumeric characters
  const codeLength = 8;

  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }

  return code;
};

const addMinutesToDate = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60000);
}

module.exports = {
  getAccountNamedKeyValue,
  getAccountInfo,
  getKeyPairOfUserSet,
  sleep,
  parseTokenMeta,
  readFileContent,
  getColorByAction,
  makeHistoryContent,
  checkForValidMongoDbID,
  addMinutesToDate,
  decryptDataWithPassphrase,
  encryptDataWithPassphrase,
  findHighestNumber,
  generateCouponCode,
  addDaysToDate
}


