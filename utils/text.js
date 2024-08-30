

const  convertToKebabCase = (s) => {
  return s.toLowerCase().replace(/[()?]/g, '').replace(/ /g, '-');
};
const replaceSpacesWithHyphen = (inputString) => {
  // Use a regular expression to match one or more spaces and replace with a hyphen
  const resultString = inputString.replace(/\s+/g, '-');
  return resultString.toLowerCase();
}
module.exports = {
  convertToKebabCase,
  replaceSpacesWithHyphen
};
