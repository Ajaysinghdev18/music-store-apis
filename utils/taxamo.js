const axios = require("axios").default;
const { v4: uuidv4 } = require("uuid");
const CCS = require('countrycitystatejson');



const getCountryByName = (countryName) => {
  const country = CCS.getCountries().find((country) => country.name == countryName);
  return country?.shortName || ''
}


const storeTransaction = (
  products,
  currencyCode,
  amountToBePaid,
  creditCardNumber,
  buyerEmail,
  buyerName,
  buyerNote,
  billingCountryCode,
  taxamoId,
  country,
  region,
  city,
  addressLine1,
  addressLine2,
) => {
  const transaction_line = products.map(item => {
    return {
      custom_id: item.id,
      description: item.name,
      amount: item.price
    }
  })

  const options = {
    method: "POST",
    url: `${process.env.TAXAMO_BASE_URL}/transactions`,
    headers: { "Content-Type": "application/json" },
    data: {
      transaction: {
        buyer_email: buyerEmail,
        buyer_name: buyerName,
        note: buyerNote,
        transaction_lines: transaction_line,
        custom_id: taxamoId,
        currency_code: currencyCode,
        billing_country_code: billingCountryCode,
        buyer_credit_card_prefix: creditCardNumber || "424242424",
        force_country_code: billingCountryCode,
        invoice_address: {
          street_name: addressLine1 || '',
          building_number: addressLine2 || '',
          city: city || '',
          region: region || '',
          country: getCountryByName(country) || '',
        }
      },
      private_token: process.env.TAXAMO_PRIVATE_TOKEN
    }
  };
  console.log(options.data.transaction.invoice_address)
  return axios
    .request(options)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      if (error.response) {
        // Request made and server responded
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
      }
    });
};

const confirmTransaction = transaction_key => {
  return axios
    .post(
      `${process.env.TAXAMO_BASE_URL}/transactions/${transaction_key}/confirm?private_token=${process.env.TAXAMO_PRIVATE_TOKEN}`
    )
    .then(function (response) {
      return response.data;
    })
    .catch(async function (error) {
      if (error.response) {
        // Request made and server responded
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
      }
    });
};

const getLocationMetadata = async buyerIpAddress => {
  try {
    let { data } = await axios.get(
      `http://www.geoplugin.net/json.gp?ip=${buyerIpAddress}`
    );
    return {
      geopluginCurrencySymbol: data.geoplugin_currencySymbol,
      geopluginCurrencyCode: data.geoplugin_currencyCode,
      geopluginCountryCode: data.geoplugin_countryCode
    };
  } catch (error) {
    console.log("🚀 ~ file: taxamo.js:120 ~ getLocationMetadata ~ error:", error)
  }
};

const calculateTaxAmount = async (
  currencyCode,
  amountToBePaid,
  buyerIpAddress,
  geoplugin_countryCode
) => {
  let customId = uuidv4();
  const options = {
    method: "POST",
    url: `${process.env.TAXAMO_BASE_URL}/tax/calculate`,
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    data: {
      transaction: {
        currency_code: currencyCode,
        transaction_lines: [
          {
            custom_id: customId,
            amount: +amountToBePaid
          }
        ],
        billing_country_code: geoplugin_countryCode, //two digit ISO
        buyer_ip: buyerIpAddress || undefined
      },
      private_token: process.env.TAXAMO_PRIVATE_TOKEN
    }
  };

  return axios
    .request(options)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.error(error);
    });
};

const deleteTransaction = transaction_key => {
  const options = {
    method: "DELETE",
    url: `${process.env.TAXAMO_BASE_URL}/transactions/${transaction_key}`,
    headers: { Accept: "application/json" }
  };

  return axios
    .request(options)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.error(error);
    });
};

module.exports = {
  confirmTransaction,
  storeTransaction,
  deleteTransaction,
  calculateTaxAmount,
  getLocationMetadata,
  getCountryByName
};
