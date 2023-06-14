const fs = require("fs");
const path = require("path");
const directoryPath = "C:\\devspace\\frontend\\myimages.zip\\public\\images\\_filespace";

function getDirectoryContents(directoryPath) {
  const stats = fs.statSync(directoryPath);
  if (!stats.isDirectory()) {
    throw new Error("Provided path is not a directory.");
  }

  const contents = fs.readdirSync(directoryPath);
  const result = [];

  for (const item of contents) {
    const itemPath = path.join(directoryPath, item);
    const itemStats = fs.statSync(itemPath);
    const isDirectory = itemStats.isDirectory();

    const itemName = isDirectory ? item : path.parse(item).name;
    const itemData = {
      name: itemName,
      type: isDirectory ? "directory" : path.extname(item).substring(1),
      size: itemStats.size,
      created: itemStats.birthtime,
      modified: itemStats.mtime,
    };

    if (itemData.type === "url") {
      // this file is a windows url shortcut
      // grab the link thats inside
      const urlFileContents = fs.readFileSync(itemPath, "utf8");
      const urlFileLines = urlFileContents.split("\n");
      const urlLine = urlFileLines.find((line) => line.startsWith("URL="));
      let url = urlLine.substring(4);

      // remove the \r from the end of the url only if there is one
      if (url.endsWith("\r")) {
        url = url.substring(0, url.length - 1);
      }
      itemData.url = url;
    }

    if (isDirectory) {
      itemData.contents = getDirectoryContents(itemPath);
    }

    result.push(itemData);
  }

  return result;
}

const directoryData = {
  name: path.basename(directoryPath),
  type: "directory",
  size: 0,
  created: "2023-05-25T10:07:12.565Z",
  modified: "2018-05-26T21:40:24.000Z",
  contents: getDirectoryContents(directoryPath),
};

const jsonData = JSON.stringify(directoryData, null, 2);
// save to file
fs.writeFileSync("FINAL_DATA.json", jsonData);
