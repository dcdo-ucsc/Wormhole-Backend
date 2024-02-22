const path = require("path");
const fs = require("fs");

/**
 * Checks if the file name already exists in the directory
 * @param {String} originalName - original file name
 * @param {Map} fileMap - Map used to check for duplicate files
 *
 * @returns {String} - file name with appended number if it already exists
 */
const dupeCheck = (originalName, fileMap) => {
  let fileName = originalName;

  // If the file name already exists, append a number to the file name
  if (fileMap.has(fileName)) {
    const count = fileMap.get(fileName);
    const extension = path.extname(fileName);
    const name = path.basename(fileName, extension);
    fileName = `${name}(${count})${extension}`;
    fileMap.set(originalName, count + 1);
  } else {
    fileMap.set(fileName, 1);
  }

  return fileName;
};

/**
 * Checks if file is deleted before downloading
 */
const fileExist = (filePath, res) => {
  if (!fs.existsSync(filePath)) {
    res.status(404).json({
      error: "File not found",
    });
    return false;
  }
  return true;
};

module.exports = { dupeCheck, fileExist };
