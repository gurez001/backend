const products = require("../models/productModels");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFetures = require("../utils/apiFeatuers");
const CountModel = require("../models/countModel");
const imageGelleryModel = require("../models/imageGelleryModel");
const toggleModel = require("../models/toggleModel");
const generateSitemap = require("../utils/sitemapUtils");
const order = require("../models/orderModels");
//------------ Feature Products

exports.featureProduct = catchAsyncError(async (req, res, nex) => {
  try {
    const Orders = await order.find();
    let max = [];

    Orders.forEach((order) => {
      order.orderItem.forEach((item) => {
        max.push(item.productId);
      });
    });

    const productFrequency = max.reduce((acc, productId) => {
      acc[productId] = (acc[productId] || 0) + 1;
      return acc;
    }, {});
    // Convert the object into an array of objects
    const productFrequencyArray = Object.entries(productFrequency).map(
      ([productId, frequency]) => ({ productId, frequency })
    );

    // Sort the array based on frequency in descending order
    const sortedProductFrequencyArray = productFrequencyArray.sort(
      (a, b) => b.frequency - a.frequency
    );

    // let c = sortedProductFrequencyArray[0]
    res.status(200).json({
      success: true,
      product:sortedProductFrequencyArray,
    });
  } catch (err) {
    console.log(err);
  }
});

// create product -- Admin

exports.createProducts = catchAsyncError(async (req, res, next) => {
  try {
    const productCounter = await CountModel.findOne({ entityName: "User" });

    const {
      name,
      price,
      maxprice,
      description,
      category,
      subcategory,
      article,
      stock,
      metatitle,
      keyword,
      metalink,
      imageId,
      metadec,
    } = req.body;

    const user = req.user.id;
    let cat = category.split(" ").join("-").toLowerCase();
    let subCat = subcategory.split(" ").join("-").toLowerCase();
    const Products = await products.create({
      _id:
        productCounter && productCounter.productCount !== null
          ? productCounter.productCount
          : 1,
      name,
      price,
      maxprice,
      description,
      article,
      category:cat,
      subcategory:subCat,
      stock,
      user,
      imageId,
      // images: {
      //   public_url: imagesPath,
      //   url: images,
      // },
      seo: {
        metatitle,
        keyword,
        metalink,
        metadec,
      },
    });

    const populatedProduct = await products
      .findById(Products._id)
      .lean()
      .exec();

    if (populatedProduct && populatedProduct.imageId) {
      await products.populate(populatedProduct, {
        path: "imageId",
        model: "Images",
      });
      await generateSitemap();
    }

    res.status(201).json({
      success: true,
      Products,
    });
  } catch (error) {
    console.log(error);
    return next(
      new ErrorHandler("Product - Internal Server Error" + error, 500)
    );
  }
});

//----------get all produts
exports.getAllProducts = catchAsyncError(async (req, res, next) => {
  try {
    const resultPerpage = 12;
    const productCount = await products.countDocuments();
    const filterProduct = await toggleModel.find();
    const newProducts = [];
    const apiFetures = new ApiFetures(products.find(), req.query)
      .search()
      .filter()
      .pagination(resultPerpage);

      console.log()
    const Products = await apiFetures.query.populate("imageId").exec();

    Products.filter((item) => {
      const createDate = new Date(item.createdate);
      const currentDate = new Date();
      const timeDifference = Math.abs(currentDate - createDate);

      // Filter products created within the last 24 hours (86400000 milliseconds in a day)
      let newProduct = timeDifference <= 15 * 24 * 60 * 60 * 1000;
      if (newProduct) {
        newProducts.push(item);
      }
    });
console.log(req.query)
console.log(Products)


    res.status(200).json({
      success: true,
      Products,
      newProducts,
      productCount,
      resultPerpage,
    });
  } catch (error) {
    return next(
      new ErrorHandler(
        "Error getting all products - Internal Server Error",
        500
      )
    );
  }
});

//----------get all produts --Admin
exports.getAdminAllProducts = catchAsyncError(async (req, res, next) => {
  try {
    let Products = await products.find();
    Products.reverse();
    // if product not found
    if (!Products) {
      // No products found
      return next(new ErrorHandler("No products found", 404));
    }
    // if product found
    res.status(200).json({
      success: true,
      Products,
    });
  } catch (error) {
    return next(
      new ErrorHandler(
        "Error fetching admin products: - Internal Server Error",
        500
      )
    );
  }
});

//------ get single products
exports.getSingleProduct = catchAsyncError(async (req, res, next) => {
  try {
    let Product;
    if (isNaN(req.params.metalink)) {
      Product = await products
        .findOne({
          "seo.metalink": req.params.metalink,
        })
        .populate({ path: "imageId", model: "Images" });
    } else {
      Product = await products
        .findById(req.params.metalink)
        .populate({ path: "imageId", model: "Images" });
      //  Product = await Product.findById(req.params.metalink).populate('imageId');
    }

    if (!Product) {
      return next(new ErrorHandler("Product not found", 404));
    }
    res.status(200).json({
      success: true,
      Product,
    });
  } catch (error) {
    console.log(error);
    return next(
      new ErrorHandler(
        "Error fetching admin products: - Internal Server Error",
        500
      )
    );
  }
});

// Update produuct -- Admin
exports.updateProducts = catchAsyncError(async (req, res, next) => {
  try {
    const productId = req.params.id;

    const {
      name,
      price,
      description,
      article,
      category,
      stock,
      metatitle,
      keyword,
      metalink,
      imageIds,
      metadec,
    } = req.body;
    const user = req.user.id;

    if (!productId) {
      return next(new ErrorHandler("Product ID is missing", 400));
    }
    let Product = await products.findById(req.params.id);

    if (!Product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    const data = {
      name,
      price,
      description,
      category,
      stock,
      user,
      imageId: imageIds,
      seo: {
        metatitle,
        keyword,
        metalink,
        metadec,
      },
    };

    Product = await products
      .findByIdAndUpdate(req.params.id, data, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
        overwrite: true, // Replace the entire document with the new data
      })
      .populate("imageId");
    // }
    Product.images = {
      url: null,
    };
    //await Product.save();

    const imagesGellery = await imageGelleryModel.updateMany(
      { "images._id": { $in: Product.imageId } },
      { $set: { "images.$[].productId": Product._id } }
    );

    // const findImage = await imageGelleryModel.find();
    // const getProductImages = findImage.flatMap((item) => item.images);

    // const filterProductImages = getProductImages.filter((item) => {
    //   return item.productId === String(Product._id);
    // });

    // Product.images = {
    //   url: filterProductImages,
    // };

    // await Product.save();

    res.status(200).json({
      success: true,
      Product,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(" Internal Error updating product:", 404));
  }
});

// Delete product --Admin

exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  try {
    let Product = await products.findById(req.params.id);

    if (!Product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    await Product.deleteOne();
    res.status(200).json({
      success: true,
      message: "Product Deleted",
    });
  } catch (error) {
    return next(new ErrorHandler(" Internal Error deleting product:", 500));
  }
});

//---------single product

exports.singleProduct = catchAsyncError(async (req, res, next) => {
  try {
    let Product = await products.findById(req.params.id);
    if (!Product) {
      return next(new ErrorHandler("Product not found", 404));
    }
    res.status(200).json({
      success: true,
      Product,
    });
  } catch (error) {
    return next(new ErrorHandler(" Internal Error Product not found:", 500));
  }
});

//--------create new review and update the reviews

exports.createProductReviews = catchAsyncError(async (req, res, next) => {
  try {
    const { rating, comment, productId } = req.body;
    const reviews = {
      user: req.user._id,
      name: req.user.name,
      image: req.user.avatar.url,
      rating: Number(rating),
      comment,
    };

    let Product = await products.findById(productId);
    const isReviewed = Product.reviews.find((rev) => {
      return rev.user.toString() === req.user._id.toString();
    });

    if (isReviewed) {
      Product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString()) {
          (rev.rating = rating),
            (rev.comment = comment),
            (rev.image = req.user.avatar.url);
        }
      });
    } else {
      Product.reviews.push(reviews);
      Product.numOfReviews = Product.reviews.length;
    }

    let review_avg = 0;
    Product.reviews.forEach((rev) => {
      review_avg += rev.rating;
    });

    Product.ratings = review_avg / Product.reviews.length;

    await Product.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
      Product: Product.reviews,
    });
  } catch (error) {
    return next(new ErrorHandler(" Internal Error review not found:", 500));
  }
});

//--------get All reviews

exports.getAllProductReviews = catchAsyncError(async (req, res, next) => {
  try {
    const Product = await products.findById(req.query.id);

    if (!Product) {
      return next(new ErrorHandler("Product not found", 404));
    }
    res.status(200).json({
      success: true,
      reviews: Product.reviews,
    });
  } catch (error) {
    return next(new ErrorHandler("Product not found:", 404));
  }
});

//--------Delete reviews

exports.DeleteProductReviews = catchAsyncError(async (req, res, next) => {
  try {
    let Product = await products.findById(req.query.productId);
    if (!Product) {
      return next(new ErrorHandler("Product not found", 404));
    }
    const reviews = Product.reviews.filter((rev) => {
      return rev._id.toString() !== req.query.id.toString();
    });

    let review_avg = 0;

    reviews.forEach((rev) => {
      review_avg += rev.rating;
    });

    const ratings = reviews.length > 0 ? review_avg / reviews.length : 0; // Check if reviews array is empty

    const numOfReviews = reviews.length;

    await products.findByIdAndUpdate(
      req.query.productId,
      {
        reviews,
        ratings,
        numOfReviews,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    res.status(200).json({
      success: true,
      reviews: reviews,
      message: "Review removed",
    });
  } catch (error) {
    return next(new ErrorHandler(" Internal Error prodduct not delete", 500));
  }
});
