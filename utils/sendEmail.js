const jwt = require('jsonwebtoken');
const nodeMailer = require("nodemailer");

exports.sendOtpMail = async (otp) => {
  try {
    const transporter = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      service: "smtp.gmail.com",
      auth: {
        user: "demo40363@gmail.com",
        pass: "iimj saoy fpnu xdjs", // Make sure to wrap the password in quotes
      },
    });

    const mailOptions = {
      from: "demo40363@gmail.com",
      to: "ps9502748@gmail.com",
      subject: "ssssss",
      text: "this is demo"+otp,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log(err);
  }
};


//--------forget password

exports.forgetPassOtpMail = async (user) => {
  try {
    const transporter = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      service: "smtp.gmail.com",
      auth: {
        user: "demo40363@gmail.com",
        pass: "iimj saoy fpnu xdjs", // Make sure to wrap the password in quotes
      },
    });

    const token = jwt.sign({ user:user._id }, process.env.JWTSECRET, { expiresIn: '5m' });

    const mailOptions = {
      from: "demo40363@gmail.com",
      to: user.email,
      subject: "ssssss",
      text: `http://localhost:3000/forget-password/${token}`,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log(err);
  }
};





exports.sendOrderEmail = async (order) => {

  const { shippingInfo, orderItem, mode } = order;
  try {
    const transporter = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      service: "smtp.gmail.com",
      auth: {
        user: "demo40363@gmail.com",
        pass: "iimj saoy fpnu xdjs", // Make sure to wrap the password in quotes
      },
    });

    const mailOptions = {
      from: "demo40363@gmail.com",
      to: "ps9502748@gmail.com",
      subject: "ssssss",
      html: `
      <html>
        <body>
          <p>Dear ${shippingInfo.fullName},</p>
          <p>Thank you for your order!</p>
          
          <h2>Shipping Information:</h2>
          <p>Name: ${shippingInfo.fullName}</p>
          <p>Phone: ${shippingInfo.phoneNo}</p>
          <p>Email: ${shippingInfo.email}</p>
          <p>Address: ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state}, ${shippingInfo.pinCode}</p>
          
          <h2>Order Details:</h2>
          <p>Product Name: ${orderItem[0].name}</p>
          <p>Price: ${orderItem[0].price}</p>
          <p>Quantity: ${orderItem[0].quantity}</p>
          
          <h2>Payment Mode:</h2>
          <p>${mode}</p>
          
     
        </body>
      </html>
    `,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log(err);
  }
};

exports.sendOrderStatusEmail = async (orderStatus) => {
    console.log(orderStatus)
    const { status,orderItem,text} = orderStatus
  try {
    const transporter = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      service: "smtp.gmail.com",
      auth: {
        user: "demo40363@gmail.com",
        pass: "iimj saoy fpnu xdjs", // Make sure to wrap the password in quotes
      },
    });

    const mailOptions = {
      from: "demo40363@gmail.com",
      to: "ps9502748@gmail.com",
      subject: "Order Dispatched: Track Your Shipment",
      html: `
      <html>
        <body>
        <h2>Shipping Status: ${status}</h2>
        <p>your Traking is #0000000</p>
        <p>${text}</p>
    
        <h2>Return Status:</h2>
        <p>If you need to return any items, please contact our customer support with your order details.</p>
        
          
     
        </body>
      </html>
    `,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log(err);
  }
};

