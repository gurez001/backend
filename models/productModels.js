const mongoose = require("mongoose");
const CountModel = require("./countModel");
const Images = require("./imageGelleryModel");

const productSchema = new mongoose.Schema({
  _id: Number,
  name: {
    type: String,
    required: [true, "Please enter product name"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please enter product description"],
  },
  article: {
    type: String,
  },
  price: {
    type: Number,
    required: [true, "Please enter product price"],
  },
  maxprice: {
    type: Number,
  },
  ratings: {
    type: Number,
    default: 0,
  },
  // imageId: Array,
  imageId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Images" }],
  images: [
    {
      public_url: Array,
      url: [
        {
          fieldname: String,
          originalname: String,
          encoding: String,
          mimetype: String,
          destination: String,
          filename: String,
          path: String,
          size: Number,
          primary:Boolean,
          creditAt:Date,
          productId:String
        },
      ],
    },
  ],
  category: {
    type: String,
    required: [true, "Please enter product category"],
  },
  subcategory: {
    type: String,
    required: [true, "Please enter product category"],
  },
  stock: {
    type: Number,
    required: [true, "Please enter product stock"],
    default: 1,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  seo: [
    {
      metatitle: {
        type: String,
        maxlength: [60, "Title should be lower then 60 characters"],
        required: true,
      },
      keyword: {
        type: String,
      },
      metadec: {
        type: String,
        maxlength: [160, "Description should be lower then 160 characters"],
        required: true,
      },
      metalink: {
        type: String,
        unique: true,
        maxlength: [60, "Link should be lower then 60 characters"],
        required: true,
      },
    },
  ],
  reviews: [
    {
      user: {
        type: Number,
        ref: "user",
        require: true,
      },
      image: {
        type: String,
      },
      name: {
        type: String,
        require: true,
      },
      rating: {
        type: Number,
        require: true,
      },
      comment: {
        type: String,
        require: true,
      },
      createdate: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  user: {
    type: Number,
    ref: "User",
    required: true,
  },
  createdate: {
    type: Date,
    default: Date.now,
  },
});

productSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    // const Counter = mongoose.model('Counter');
    const counter = await CountModel.findOneAndUpdate(
      { entityName: "User" }, // Use a unique name for each entity
      { $inc: { productCount: 1 } },
      { new: true, upsert: true }
    );

    this._id = counter.productCount;

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Product", productSchema);
