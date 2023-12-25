const speakeasy = require('speakeasy');

// Generate a secret
const secret = speakeasy.generateSecret({ length: 20 });
exports.generateOtp=()=>{
    const otp = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32',
      });
    return otp;
}
exports.otpVerify=(otp)=>{
  const isValid = speakeasy.totp.verify({
    secret: secret.base32,
    encoding: 'base32',
    token: otp,
    window: 2, // Allow codes that are within 2 time steps (30 seconds each) from the current time
  });
  console.log(isValid)
      
    return isValid;
}