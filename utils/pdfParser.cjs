const fs = require("fs");
const pdf = require("pdf-extraction");

module.exports.extractTextFromPDF = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const data = await pdf(buffer);
  return data.text;
};
