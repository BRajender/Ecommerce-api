const express = require("express");
const validate = require("../middlewares/validate");
const { authenticateToken } = require("../middlewares/auth");
const { productValidation } = require("../validations");
const { productController } = require("../controllers");
const multer = require("multer");
const router = express.Router();
const path = require("path");

const imageStorage = multer.diskStorage({
  // Destination to store image
  destination: "src/uploads",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
    // file.fieldname is name of the field (image)
    // path.extname get the uploaded file extension
  },
});

const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error("Please upload a Image"));
    }
    cb(undefined, true);
  },
});

router
  .route("/addProduct")
  .post(
    authenticateToken,
    imageUpload.single("productImage"),
    productController.addProduct
  );

router
  .route("/checkout")
  .post(
    authenticateToken,
    validate(productValidation.checkout),
    productController.checkout
  );

router
  .route("/deleteProduct")
  .post(
    authenticateToken,
    validate(productValidation.deleteProduct),
    productController.deleteProduct
  );

router.route("/getProducts").post(
  validate(productValidation.getProducts),
  productController.getProducts
);

router.route("/editProduct").post(
  authenticateToken,
  imageUpload.single("productImage"),
  productController.editProduct
);

router
  .route("/addToCart")
  .post(
    authenticateToken,
    validate(productValidation.addToCart),
    productController.addToCart
  );

router
  .route("/search")
  .post(
    validate(productValidation.search),
    productController.search
  );

router
  .route("/fetchOrders")
  .post(
    authenticateToken,
    validate(productValidation.fetchOrders),
    productController.fetchOrders
  );

router
  .route("/deleteFromCart")
  .post(
    authenticateToken,
    validate(productValidation.deleteFromCart),
    productController.deleteFromCart
  );

router
  .route("/removeFromCart")
  .post(
    authenticateToken,
    validate(productValidation.removeFromCart),
    productController.removeFromCart
  );

router
  .route("/getCartDetails")
  .post(
    authenticateToken,
    validate(productValidation.getCartDetails),
    productController.getCartDetails
  );

router
  .route("/getProductCategory")
  .post(productController.getProductCategory);

router
  .route("/addProductCategory")
  .post(
    authenticateToken,
    validate(productValidation.addProductCategory),
    productController.addProductCategory
  );

module.exports = router;
