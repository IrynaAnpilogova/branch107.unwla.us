const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Path to the folder containing the images
const sourceFolder = './images'; // Replace with your source folder path
const destinationFolder = './output'; // Replace with your destination folder path

// Maximum allowed image dimensions (e.g., 2000px by 2000px)
const MAX_DIMENSION = 1200;

// Function to ensure the destination folder exists
const ensureDestinationFolderExists = (filePath) => {
  const folderPath = path.dirname(filePath);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

// Function to read files recursively from a directory
const getFilesRecursively = (dirPath) => {
  let results = [];

  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath));
    } else {
      results.push(fullPath);
    }
  });

  return results;
};

// Function to convert images to webp format with resizing if needed
const convertImagesToWebp = (sourceFolder, destinationFolder) => {
  const imageFiles = getFilesRecursively(sourceFolder).filter(file => /\.(jpg|jpeg|png|gif|tiff)$/i.test(file));

  imageFiles.forEach(file => {
    const inputFilePath = file;
    const outputFilePath = path.join(destinationFolder, path.relative(sourceFolder, file).replace(path.extname(file), '.webp'));

    // Ensure the destination folder exists, including subfolders
    ensureDestinationFolderExists(outputFilePath);

    sharp(inputFilePath)
      .metadata()
      .then(metadata => {
        let image = sharp(inputFilePath);
        if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
          console.log(`Resizing ${file} because it exceeds the maximum dimensions.`);
          image = image.resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside' });
        }

        ensureDestinationFolderExists(outputFilePath);

        image
          .webp()
          .toFile(outputFilePath, (err, info) => {
            if (err) {
              console.error(`Error converting ${file} to webp:`, err);
            } else {
              console.log(`Successfully converted ${file} to webp:`, info);
            }
          });
      })
      .catch(err => {
        console.error(`Error processing ${file}:`, err);
      });
  });
};

// Run the conversion
convertImagesToWebp(sourceFolder, destinationFolder);
