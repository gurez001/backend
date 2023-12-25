const catchAsyncError = require("../middleware/catchAsyncError");
const countModel = require("../models/countModel");
const imageGelleryModel = require("../models/imageGelleryModel");
const ApiFetures = require("../utils/apiFeatuers");
const ErrorHandler = require("../utils/errorhandler");

exports.getAllImages = catchAsyncError(async (req, res, next) => {
  try {
    const resultPerpage = 20;
    const imageCount = await imageGelleryModel.countDocuments();

    const apiFetures = new ApiFetures(imageGelleryModel.find(), req.query)
      .search()
      .filter()
      .pagination(resultPerpage);
    // Execute the query
    let images = await apiFetures.query;

   
    res.status(200).json({
      success: true,
      images,
      imageCount,
      resultPerpage,
    });
  } catch (err) {
    return next(new ErrorHandler("images - Internal Server Error" + err, 500));
  }
});

exports.createImageGellery = catchAsyncError(async (req, res, next) => {
  try {
    const { userid } = req.body;
    const productCounter = await countModel.findOne({ entityName: "User" });

    const images = [];

    const avatarPath = req.files;

    avatarPath.forEach((item, i) => {
      images.push({
        fieldname: item.fieldname,
        originalname: item.originalname,
        encoding: item.encoding,
        mimetype: item.mimetype,
        destination: item.destination,
        filename: item.filename,
        path: item.path,
        size: item.size,
        productId: userid,
      });
      //imagesPath.push(item.path);
    });

    console.log(req.body);
    const imagesGellery = await imageGelleryModel.create(images);

    res.status(201).json({
      success: true,
      imagesGellery,
    });
  } catch (error) {
    console.log(error);
    return next(
      new ErrorHandler("Product - Internal Server Error" + error, 500)
    );
  }
});

//--------update gellery image

exports.updateImageGellery = catchAsyncError(async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log(req.body, id);
    const { altText, title, caption } = req.body;
    const updatedImage = await imageGelleryModel.findOneAndUpdate(
      { _id: id },
      {
        filename:title,
        altText,
        title,
        caption,
      }
    );
    if (!updatedImage) {
      return next(new ErrorHandler("Image not found", 404));
    }
    console.log(updatedImage);
    res.status(200).json({
      success: true,
      message: "Image updated successfully",
    });
  } catch (error) {
    console.log(error);
    return next(
      new ErrorHandler("Product - Internal Server Error" + error, 500)
    );
  }
});
