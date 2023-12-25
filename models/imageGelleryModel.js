const mongoose = require("mongoose");
const countModel = require("./countModel");
const imageGellerySchema = new mongoose.Schema({
  fieldname: String,
  originalname: String,
  encoding: String,
  mimetype: String,
  destination: String,
  filename: String,
  path: String,
  size: Number,
  altText: String,
  title: String,
  caption: String,
  primary: {
    type: Boolean,
    default: false,
  },
  productId: String,
  creditAt: {
    type: Date,
    default: Date.now(),
  },
});

// imageGellerySchema.pre("save", async function (next) {
//   if (!this.isNew) {
//     return next();
//   }

//   try {
//     // const Counter = mongoose.model('Counter');
//     const counter = await countModel.findOneAndUpdate(
//       { entityName: "User" }, // Use a unique name for each entity
//       { $inc: { imageCount: 1 } },
//       { new: true, upsert: true }
//     );

//     this._id = counter.imageCount;

//     next();
//   } catch (err) {
//     next(err);
//   }
// });

module.exports = mongoose.model("Images", imageGellerySchema);
