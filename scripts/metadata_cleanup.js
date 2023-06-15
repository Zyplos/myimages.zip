const fs = require("fs").promises;
const path = require("path");

const exiftool = require("exiftool-vendored").exiftool;

async function exiftoolProcess(filePath) {
  try {
    const tags = await exiftool.read(filePath);
    // console.log("Tags", tags);
    const gpsTags = Object.keys(tags);

    // any keys that contain GPS should be put into an array
    const gpsTagsArray = gpsTags.filter((tag) => tag.includes("GPS"));
    // console.log("GPS TAGS", gpsTagsArray);

    if (gpsTagsArray.length === 0) {
      console.log("Processed " + filePath);
      return;
    } else {
      console.log("!!!!!!!!!!!!!! GPS tags found: " + filePath);
    }

    // make new object key:null
    const nullifiedTags = gpsTagsArray.reduce((acc, curr) => {
      acc[curr] = null;
      return acc;
    }, {});
    console.log("NULLIFIED TAGS", nullifiedTags);

    await exiftool.write(filePath, nullifiedTags);
    await fs.unlink(filePath + "_original");
  } catch (error) {
    console.error("==== ERROR");
    console.error(error);
  }
}

const directoryPath = "C:\\devspace\\frontend\\myimages.zip\\public\\images\\_filespace";
const extensionsSet = new Set();

// function readFilesSync(directory) {
//   const files = fs.readdirSync(directory);

//   files.forEach(async (file) => {
//     const filePath = path.join(directory, file);
//     const stats = fs.statSync(filePath);

//     if (stats.isDirectory()) {
//       // Recursively read files in subdirectory
//       readFilesSync(filePath, extensionsSet);
//     } else {
//       const fileExtension = path.extname(filePath);
//       await exiftoolProcess(filePath).catch(console.error);
//       extensionsSet.add(fileExtension);
//     }
//   });
// }

async function readFilesAsync(directory) {
  const files = await fs.readdir(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = await fs.stat(filePath);

    if (stats.isDirectory()) {
      // Recursively read files in subdirectory
      await readFilesAsync(filePath, extensionsSet);
    } else {
      const fileExtension = path.extname(filePath);
      await exiftoolProcess(filePath).catch(console.error);
      extensionsSet.add(fileExtension);
    }
  }
}
// Provide the directory path here

readFilesAsync(directoryPath).then(async () => {
  console.log("DONE");
  console.log("FINAL", [...extensionsSet]);
  await fs.writeFile("EXTRA_DATA.json", JSON.stringify([...extensionsSet], null, 2));
  exiftool.end();
});
