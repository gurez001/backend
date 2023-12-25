const catchAsyncError = require("../middleware/catchAsyncError");
const CountModel = require("../models/countModel");
const order = require("../models/orderModels");
const product = require("../models/productModels");
const ErrorHandler = require("../utils/errorhandler");
const { sendOrderEmail, sendOrderStatusEmail } = require("../utils/sendEmail");

//------create new order

exports.createOrder = catchAsyncError(async (req, res, next) => {
  try {
    const count = await CountModel.findOne({ entityName: "User" });

    const {
      shippinginfo,
      orderItem,
      paymentInfo,
      itemPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      coupon,
      razorpay_order_id,
    } = req.body;
   

    const { mode } = paymentInfo;

    const Order = await order.create({
      _id: count && count.count !== null ? count.orderCount : 1,
      shippingInfo: shippinginfo,
      orderItem,
      paymentInfo,
      itemPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      coupon,
      paymentInfo: {
        razorpay_order_id,
        mode,
      },
      paidAt: Date.now(),
      user: req.user._id,
    });

    const orderConfermation = {
      shippingInfo: shippinginfo,
      orderItem,
      mode,
    };
    sendOrderEmail(orderConfermation);
    res.status(201).json({
      success: true,
      Order,
    });
  } catch (err) {
    console.log(err);
  }
});

// get single order
exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
  const Order = await order
    .findById(req.params.id)
    .populate("user", "name email");
  if (!Order) {
    return next(new ErrorHandler("order not found with this is", 404));
  }
  res.status(201).json({
    success: true,
    Order,
  });
});

// get logged in user order
exports.myOrders = catchAsyncError(async (req, res, next) => {
  const Orders = await order.find({ user: req.user._id });
  Orders.reverse();
  res.status(201).json({
    success: true,
    Orders,
  });
});

// get all ordwers   ----------- admin

exports.getAllOrders = catchAsyncError(async (req, res, next) => {
  const Orders = await order.find();
  let totalAmount = 0;
  let max = [];
  Orders.forEach((order) => {
    totalAmount += order.totalPrice;
    order.orderItem.forEach((item) => {
      max.push(item.productId);
    });
  });

  const productFrequency = max.reduce((acc, productId) => {
    acc[productId] = (acc[productId] || 0) + 1;
    return acc;
  }, {});

  Orders.reverse();
  res.status(201).json({
    success: true,
    totalAmount,
    Orders,
    productFrequency,
  });
});

// Update order status ----------- admin

exports.updateOrder = catchAsyncError(async (req, res, next) => {
  const Order = await order.findById(req.params.id);

  const { paymentInfo, orderItem } = Order;

  const {
    status,
    name,
    address,
    pinCode,
    city,
    country,
    state,
    email,
    phoneNo,
    link,
  } = req.body;

  const data = {
    orderStatus: status,
    shippingInfo: {
      fullName: name,
      phoneNo,
      email,
      address,
      country,
      state,
      city,
      pinCode,
    },
  };

  if (!Order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  Order.orderStatus = data.orderStatus;
  Order.shippingInfo = data.shippingInfo;

  if (Order.orderStatus === "Delivered") {
    //  return next(new ErrorHandler("We have already delivered this order", 404));
    Order.deliveredAt = Date.now();
  }

  if (Order.orderStatus === "Shipped") {
    const errors = [];
    for (const o of Order.orderItem) {
      try {
        // console.log(Order.orderItem);
        await updateStatus(o.productId, o.quantity, link);
        const orderS = {
          status: Order.orderStatus,
          paymentInfo,
          orderItem,
          text: "Your order is currently being processed and will be shipped soon. You will receive a tracking number once it's shipped.",
        };
        sendOrderStatusEmail(orderS);
      } catch (error) {
        errors.push(error.message);
      }
    }
    if (errors.length > 0) {
      return next(new ErrorHandler(errors.join("\n"), 400));
    }
  }
  if (Order.orderStatus === "Return" || Order.orderStatus === "Cancle") {
    const errors = [];
    for (const o of Order.orderItem) {
      try {
        await updateStock(o.productId, o.quantity, Order.orderStatus, link);
        if (Order.orderStatus === "Return") {
          const orderS = {
            status: Order.orderStatus,
            paymentInfo,
            orderItem,
            text: "Once we receive the returned item, our team will inspect it. You will receive a confirmation email regarding the completion of the return process.",
          };
          sendOrderStatusEmail(orderS);
        }
      } catch (error) {
        errors.push(error.message);
      }
    }
    if (errors.length > 0) {
      return next(new ErrorHandler(errors.join("\n"), 400));
    }
  }

  // if (req.body.status === "Delivered") {
  //   Order.deliveredAt = Date.now();
  // }

  await Order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    Order,
  });
});

async function updateStatus(id, quantity, productId) {
  console.log(id, quantity, productId);
  try {
    for (let i = 0; i < id.length; i++) {
      const prodId = id[i];
      const quant = quantity[i];
      const Product = await product.findOne({ "seo.metalink": prodId });

      if (!Product) {
        throw new Error(`Product not found for ID: ${prodId}`);
      }

      Product.stock -= quant;
      await Product.save({ validateBeforeSave: false });
    }
  } catch (err) {
    throw new Error(`Internal server error: ${err}`);
  }
}

async function updateStock(id, quantity, status, productId) {
 try{
  for (let i = 0; i < id.length; i++) {
    const prodId = id[i];
    const quant = quantity[i];

    const Product = await product.findOne({ "seo.metalink": prodId });
    if (!Product) {
      throw new Error(`Product not found for ID: ${prodId}`);
    }
    Product.stock += quant;
    await Product.save({ validateBeforeSave: false });
  }
 }
 catch(err){
  throw new Error(`Internal server error: ${err}`);
 }
}

// Delete order   ----------- admin

exports.deleteOrders = catchAsyncError(async (req, res, next) => {
  const Order = await order.findById(req.params.id);
  if (!Order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  await Order.deleteOne();
  res.status(201).json({
    success: true,
    message: "order-delete",
  });
});
