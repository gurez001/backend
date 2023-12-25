const mongoose = require("mongoose");
const CountModel = require("./countModel");

const orderSchema = new mongoose.Schema({
  _id: Number,
  shippingInfo: {
    fullName: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
      default: "India",
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    pinCode: {
      type: Number,
      required: true,
    },
  },
  orderItem: [
    {
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      image: {
        type: Array,
        required: true,
      },
      productId: {
        type: Number,
        ref: "Product",
        required: true,
      },
      link: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: Number,
    ref: "User",
  },
  paymentInfo: {
    razorpay_payment_id: {
      type: String,
    },
    razorpay_order_id: {
      type: String,
    },
    razorpay_signature: {
      type: String,
    },
    id: String,
    mode: String,
  },
  paidAt: {
    type: Date,
  },
  itemPrice: {
    type: Number,
    default: 0,
    required: true,
  },
  taxPrice: {
    type: Number,
    default: 0,
    required: true,
  },
  shippingPrice: {
    type: Number,
    default: 0,
    required: true,
  },
  totalPrice: {
    type: Number,
    default: 0,
    required: true,
  },
  coupon: {
    type: String,
    default: null,
  },
  orderStatus: {
    type: String,
    required: true,
    default: "Processing",
  },
  deliveredAt: Date,
  creditAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    // const Counter = mongoose.model('Counter');
    const counter = await CountModel.findOneAndUpdate(
      { entityName: "User" }, // Use a unique name for each entity
      { $inc: { orderCount: 1 } },
      { new: true, upsert: true }
    );

    this._id = counter.orderCount;

    next();
  } catch (err) {
    next(err);
  }
});
module.exports = mongoose.model("order", orderSchema);
