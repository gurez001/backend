const express = require("express");
const {
  getAllImages,
  createImageGellery,
  updateImageGellery,
} = require("../controllers/imageGelleryController");
const { isAuthenticatedUser } = require("../middleware/auth");
const upload = require("../middleware/multer");
const router = express.Router();

router.route("/admin/images").get(isAuthenticatedUser, getAllImages);
router.route("/admin/images/update/:id").put(isAuthenticatedUser, updateImageGellery);
router
  .route("/admin/images/upload")
  .post(isAuthenticatedUser, upload.array("avatar"), createImageGellery);
module.exports = router;
