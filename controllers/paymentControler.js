const Razorpay = require("razorpay");
const catchAsyncError = require("../middleware/catchAsyncError");
const crypto = require("crypto");
const orderModels = require("../models/orderModels");
const ErrorHandler = require("../utils/errorhandler");
const axios = require("axios");

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

exports.proccessPayment = catchAsyncError(async (req, res, next) => {
  try {
    const options = {
      amount: Number(req.body.amount * 100), // amount in the smallest currency unit
    };
    const order = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    return next(new ErrorHandler(`Error creating Razorpay order${err}`, 500));
  }
});

exports.paymentVerification = catchAsyncError(async (req, res, next) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const sign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(body.toString())
      .digest("hex");

    const isMatch = sign === razorpay_signature;
    if (isMatch) {
      try {
        const existingOrder = await orderModels.findOne({
          "paymentInfo.razorpay_order_id": razorpay_order_id,
        });

        if (existingOrder) {
          // Update the existing order's payment information and other fields
          existingOrder.paymentInfo = {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
          };
          existingOrder.mode = "online";
          existingOrder.paidAt = Date.now();

          const order = await instance.payments.fetch(razorpay_payment_id);

          existingOrder.paymentInfo.id = order.id;

          await existingOrder.save();

          // Save the updated existingOrder with paymentInfo.data
          res.redirect(
            `http://localhost:3000/order/success?reference=${razorpay_order_id}`
          );
        }

        // Redirect to a success page with a reference
      } catch (error) {
        return next(new ErrorHandler("Order not found:" + error, 404));
      }
    } else {
      return next(new ErrorHandler("Invalid Razorpay signature" + error, 400));
    }
  } catch (err) {
    return next(new ErrorHandler(`Error in payment verification: ${err}`, 500));
  }
});

exports.paymentApiKey = catchAsyncError(async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_API_KEY,
      secretKey: process.env.RAZORPAY_SECRET_KEY,
    });
  } catch (err) {
    return next(new ErrorHandler(`Error in api env file: ${err}`, 500));
  }
});

exports.payentDataApi = catchAsyncError(async (req, res, next) => {
  try {
    const { id } = req.body;

    const { data } = await axios.get(
      `https://api.razorpay.com/v1/payments/${id}`,
      {
        auth: {
          username: process.env.RAZORPAY_API_KEY,
          password: process.env.RAZORPAY_SECRET_KEY,
        },
      }
    );
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return next(new ErrorHandler(`Error in api env file: ${err}`, 500));
  }
});
