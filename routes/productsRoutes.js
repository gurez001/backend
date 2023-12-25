const express = require("express");
const {
  getAllProducts,
  createProducts,
  updateProducts,
  deleteProduct,
  getSingleProduct,
  createProductReviews,
  DeleteProductReviews,
  getAllProductReviews,
  getAdminAllProducts,
  featureProduct,
} = require("../controllers/productsController");
const router = express.Router();
const { isAuthenticatedUser, authorizeRols } = require("../middleware/auth");
const upload = require("../middleware/multer");

router.route("/products").get(getAllProducts);
router.route("/feature-product").get(featureProduct);
router
  .route("/admin/products")
  .get(isAuthenticatedUser, authorizeRols("admin"), getAdminAllProducts);
router
  .route("/product/new")
  .post(
    isAuthenticatedUser,
    authorizeRols("admin"),
    upload.array("avatar", 4),
    createProducts
  );
router
  .route("/product/:id")
  .put(
    isAuthenticatedUser,
    authorizeRols("admin"),
    upload.array("avatar", 4),
    updateProducts
  )
  .delete(isAuthenticatedUser, authorizeRols("admin"), deleteProduct)
 // .get(getSingleProduct);
router.route("/product/:metalink").get(getSingleProduct);

router.route("/review").put(isAuthenticatedUser, createProductReviews);

router
  .route("/review")
  .get(getAllProductReviews)
  .delete(isAuthenticatedUser, DeleteProductReviews);

module.exports = router;
