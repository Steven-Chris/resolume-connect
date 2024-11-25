const express = require("express");
const router = express.Router();
const {
  addProduct,
  updateProducts,
  deleteProduct,
  addAgent,
} = require("../controllers/adminController");

//==== PRODUCT ENDPOINTS
router.post("/product", addProduct);
router.patch("/product", updateProducts);
router.delete("/product", deleteProduct);

//===== AGENT ENDPOINTS
router.post("/agent", addAgent);

module.exports = router;
