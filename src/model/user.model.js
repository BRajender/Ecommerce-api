const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, "Email required"],
    },
    mobile: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);



// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

// userSchema.index({ appointmentId: 1 });

const userModel = mongoose.model("users", userSchema, "users");


module.exports = { userModel };
