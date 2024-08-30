const { currencyData } = require("../constants/currency");

const accumulator = array => {
  const initialValue = 0;
  return array.reduce(
    (previousValue, currentValue) => previousValue + currentValue.price * (currentValue.currency ? currencyData[currentValue.currency] : 1),
    initialValue
  );
};

module.exports = accumulator;
