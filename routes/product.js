const express = require("express");
//const {  } = require('../controller/category');
const {
  requireSignin,
  adminMiddleware,
  uploadS3,
} = require("../common-middleware");
const {
  createProduct,
  getProductsBySlug,
  getProductDetailsById,
  deleteProductById,
  getProducts,
  getProductsByUser,
  activatewebsite,
  deleteProductByIdPramas,
  updateProduct,
  updateProductId,
  getProductsByFilter,
} = require("../controller/product");
const multer = require("multer");
const router = express.Router();
const shortid = require("shortid");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, shortid.generate() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post(
  "/product/create",
  requireSignin,
  upload.array("productPicture"),
  createProduct
);
router.get("/products/:slug", getProductsBySlug);
router.post("/products/filter", getProductsByFilter);
router.get("/product/:productId", getProductDetailsById);
router.delete("/product/deleteProductById", deleteProductById);
router.delete("/product/:productId", deleteProductByIdPramas);
router.put("/product/update", updateProduct);
router.put("/products/product/update", updateProductId);
router.post(
  "/product/getProducts",
  requireSignin,
  adminMiddleware,
  getProducts
);
router.post("/activateprod/:siteid", requireSignin, activatewebsite);
router.get("/:uid/products", getProductsByUser);
module.exports = router;
