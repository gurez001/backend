const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userCountModel = require("./countModel");
// const crypto = require('crypto')

const userSchema = new mongoose.Schema({
  _id: {
    type: Number,
  },
  name: {
    type: String,
    required: [true, "Please enter your name"],
    maxLength: [30, "Name cannot exceed 30 characters"],
    minLength: [4, "Name should have more then 4 characters"],
  },
  email: {
    type: String,
    required: [true, "Please enter your name"],
    unique: true,
    validator: [validator.IsEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    unique: true,
    minLength: [4, "Passowrd should be greater then 4 characters"],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  role: {
    type: String,
    default: "user",
  },
  verified: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
});

userSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    // const Counter = mongoose.model('Counter');
    const counter = await userCountModel.findOneAndUpdate(
      { entityName: "User" }, // Use a unique name for each entity
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );

    this._id = counter.count;

    // Hash the password
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }

    next();
  } catch (err) {
    next(err);
  }
});

// userSchema.pre("save", async function (next) {
//     if (!this.isNew) {
//         return next();
//       }
//       try {
//         const Counter = mongoose.model('Counter');
//         const counter = await Counter.findOneAndUpdate(
//           { entityName: 'User' }, // Use a unique name for each entity
//           { $inc: { count: 1 } },
//           { new: true, upsert: true }
//         );

//         this._id = counter.count;
//         next();
//       } catch (err) {
//         next(err);
//       }
//   });

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     next();
//   }
//   this.password = await bcrypt.hash(this.password, 10);
// });

// jwt token

userSchema.methods.getJWTtoken = function () {
  return jwt.sign({ id: this._id }, process.env.JWTSECRET, {
    expiresIn: process.env.JWT_EXPIRETIME,
  });
};

// //---------compare password

userSchema.methods.comparePassword = async function (pass) {
  return await bcrypt.compare(pass, this.password);
};

// //---------getResetPassword reset tokrn
// userSchema.methods.getResetPassword = function () {
//     //----generating token
//     const resetToken = crypto.randomBytes(20).toString("hex");
//     // heshing and add to user schema
//     this.resetPasswordToken = crypto.createHash("sha256")
//         .update(resetToken)
//         .digest("hex");

//     this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
//     return resetToken;
// }

module.exports = mongoose.model("User", userSchema);
