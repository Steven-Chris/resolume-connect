const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const s3 = require("../../config/awsConfig"); // Import S3 configuration

const IMAGE_DIR = path.join(__dirname, "../../product_img"); // Adjust the path to your images directory

/**
 * Overlay SKU ID on the image with specific styling and save it with a _marked suffix.
 * @param {string} filename - The name of the image file.
 * @param {string} skuId - The SKU ID to overlay on the image.
 * @returns {Promise<string>} - The path of the saved image with the SKU ID overlay.
 */
const overlaySkuIdOnImage = async (filename, skuId) => {
  try {
    // Define paths
    const filePath = path.join(IMAGE_DIR, filename);
    const extname = path.extname(filename);
    const basename = path.basename(filename, extname);
    const outputFilePath = path.join(IMAGE_DIR, `${basename}_marked${extname}`);

    // Process the image
    await sharp(filePath)
      .metadata()
      .then(async (metadata) => {
        // Adjust the size of the SVG box according to the image width
        const svgHeight = 40; // Fixed height for the text box
        const svgWidth = 80; // Fixed height for the text box

        // Create the SVG with adjusted width
        const textOverlayWithWidth = Buffer.from(`
          <svg width="80" height="40">
            <style>
              .background { fill: white;}
              .text { font: bold 20px sans-serif; fill: black; text-anchor: middle; dominant-baseline: middle; }
            </style>
            <rect x="0" y="0"  width="80" height="40" class="background"/>
            <text x="50%" y="50%" class="text" dy="0.2em">${skuId.toUpperCase()}</text>
          </svg>
        `);

        // Overlay the text on the bottom-right corner of the image
        await sharp(filePath)
          .composite([{ input: textOverlayWithWidth, gravity: "southeast" }])
          .toFile(outputFilePath); // Save the new image
      });

    // Upload to S3
    const fileStream = fs.createReadStream(outputFilePath);
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET, // Your S3 bucket name
      Key: `marked_images/${path.basename(outputFilePath)}`, // S3 file path
      Body: fileStream,
      ContentType: "image/jpeg", // Adjust content type based on your image type
    };

    const { Location } = await s3.upload(uploadParams).promise();

    // Unlink the local file
    fs.unlinkSync(outputFilePath);
    fs.unlinkSync(filePath);

    return Location; // Return the S3 URL
  } catch (err) {
    throw new Error(`Error overlaying SKU ID on image: ${err.message}`);
  }
};

module.exports = { overlaySkuIdOnImage };
