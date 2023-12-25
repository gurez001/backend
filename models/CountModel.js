const mongoose = require("mongoose");
const counterSchema = new mongoose.Schema({
  entityName: { type: String, required: true },
  count: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
  productCount: { type: Number, default: 0 },
  imageCount: { type: Number, default: 0 },
});
module.exports = mongoose.model("Counter", counterSchema);
