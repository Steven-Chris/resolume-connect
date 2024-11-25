const sequelize = require("../../config/sequelize");
const { Sequelize } = require("sequelize");
const Product = require("../../models/product"); // Import the Product model
const User = require("../../models/user"); // Import the Product model
const ProductSize = require("../../models/productSize"); // Import the Product model
const { handleError } = require("../lib/errorHandling");
const constantConfig = require("../../config/constantConfig");
const upload = require("../../config/multerConfig"); // Import the upload configuration
const { overlaySkuIdOnImage } = require("../../api/utils/imageUtils"); // Adjust path as needed

module.exports.addProduct = (req, res) => {
  // Use upload middleware with a custom filename
  upload.single("image")(req, res, async (err) => {
    if (err) {
      handleError("error", err, "");
      return res.status(constantConfig.INTERNAL_SERVER_ERROR).json({
        status: constantConfig.ERROR,
        message: constantConfig.SOMETHING_WENT_WRONG,
      });
    }
    try {
      const { name, price, type, sizes } = req.body;
      const file = req.file.filename;

      const saveProduct = await Product.create({
        name,
        price,
        type,
      });

      const bulkSaveSizes = [];
      for (const size of JSON.parse(sizes)) {
        bulkSaveSizes.push({ ...size, product_id: saveProduct.id });
      }

      await ProductSize.bulkCreate(bulkSaveSizes);

      const s3Url = await overlaySkuIdOnImage(file, saveProduct.sku_id);

      // Update product with S3 URL
      await Product.update(
        { image_url: s3Url },
        { where: { id: saveProduct.id } }
      );

      res.status(201).json({ message: "success", id: saveProduct.id });
    } catch (err) {
      handleError("error", err, "");
      return res.status(constantConfig.INTERNAL_SERVER_ERROR).json({
        status: constantConfig.ERROR,
        message: constantConfig.SOMETHING_WENT_WRONG,
      });
    }
  });
};

module.exports.updateProducts = async (req, res) => {
  let transaction;
  try {
    const { id, name, type, price, size: sizes } = req.body;

    if (!id) {
      res.status(400).json({ message: "Invalid request" });
    }

    transaction = await sequelize.transaction();

    const productFields = {};
    if (name) productFields.name = name;
    if (price) productFields.price = price;
    if (type) productFields.type = type;

    if (Object.keys(productFields).length > 0) {
      await Product.update(productFields, {
        where: { id },
        transaction,
      });
    }

    if (sizes && sizes.length > 0) {
      await ProductSize.destroy({
        where: { product_id: id },
        transaction,
      });
    }

    const bulkSaveSizes = [];
    for (const size of sizes) {
      bulkSaveSizes.push({ ...size, product_id: id });
    }

    if (bulkSaveSizes.length > 0)
      await ProductSize.bulkCreate(bulkSaveSizes, { transaction });

    await transaction.commit();
    return res.status(200).json({ message: "successfully updated" });
  } catch (err) {
    handleError("error", err);
    if (transaction) await transaction.rollback();
    return res.status(constantConfig.INTERNAL_SERVER_ERROR).json({
      status: constantConfig.ERROR,
      message: constantConfig.SOMETHING_WENT_WRONG,
    });
  }
};

module.exports.deleteProduct = async (req, res) => {
  let transaction;
  try {
    const productId = req.query.id;

    transaction = await sequelize.transaction();

    await ProductSize.destroy({
      where: { product_id: productId },
      transaction,
    });

    const deleteProduct = await Product.destroy({
      where: { id: productId },
      transaction,
    });

    if (!deleteProduct) {
      await transaction.rollback();
      return res.status(404).json({ message: "Product not found" });
    }

    await transaction.commit();
    return res
      .status(201)
      .json({ message: `successfully deleted product: ${productId}` });
  } catch (err) {
    handleError("error", err);
    if (transaction) await transaction.rollback();
    return res.status(constantConfig.INTERNAL_SERVER_ERROR).json({
      status: constantConfig.ERROR,
      message: constantConfig.SOMETHING_WENT_WRONG,
    });
  }
};

module.exports.addAgent = async (req, res) => {
  try {
    const { name, number } = req.body;

    await User.create({
      username: name,
      number,
      role_id: 1,
    });

    return res
      .status(201)
      .json({ message: `successfully added agent: ${name}` });
  } catch (err) {
    handleError("error", err);
    if (err instanceof Sequelize.UniqueConstraintError) {
      return res.status(409).json({
        status: constantConfig.ERROR,
        message: `Agent with number ${req.body.number} already exists`,
      });
    } else {
      return res.status(constantConfig.INTERNAL_SERVER_ERROR).json({
        status: constantConfig.ERROR,
        message: constantConfig.SOMETHING_WENT_WRONG,
      });
    }
  }
};
