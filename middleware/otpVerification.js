const catchAsyncError = require("./catchAsyncError");

exports.otpV = catchAsyncError(async (req, res, next) => {
   
  const { userOtp } = req.body;


  const secret = 'your-otp-secret-key'; // Replace with a secure method to store secrets
  const isValidOTP = otplib.authenticator.check(userOtp, secret);
  if(!isValidOTP){
    console.log('wrong otmp')
  }

});
