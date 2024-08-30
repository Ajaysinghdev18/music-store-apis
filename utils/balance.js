const { default: axios } = require("axios");
const Coinpayments = require("coinpayments");

const getBalanceWithConversionRate = async (balance, cryptos) => {
  const userBalances = {};
  const client = new Coinpayments({
    key: process.env.COINPAYMENTS_KEY,
    secret: process.env.COINPAYMENTS_SECRET
  });
  const rates = await client.rates({
    short: true
  });
  const btc_to_usd = rates.USDC?.rate_btc;
  console.log("🚀 ~ file: balance.js:15 ~ getBalanceWithConversionRate ~ btc_to_usd:", btc_to_usd)
  cryptos.map(crypto => {
    if (crypto !== 'CSPR') {
      const cryptoBalance = balance[crypto] || 0;
      const rate = rates[crypto]?.rate_btc
        ? rates[crypto]?.rate_btc / btc_to_usd
        : 1;
      const toUSD = cryptoBalance * rate;
      userBalances[crypto] = {
        balance: cryptoBalance,
        usd: +toUSD.toFixed(2),
        rate
      };
    }
  });
  if (cryptos?.includes('CSPR') || balance.CSPR) {
    const { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=casper-network&vs_currencies=usd');
    let rate = data['casper-network'].usd;
    userBalances['CSPR'] = {
      balance: balance.CSPR || 0,
      usd: rate * balance.CSPR || 0,
      rate
    }
  }
  return userBalances;
};

module.exports = { getBalanceWithConversionRate };
