const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { userModel } = require("../model/user.model");
const catchAsync = require("../utils/catchAsync");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// *** To add a new dispute to an appointment ***
const login = catchAsync(async (req, res) => {
  const { body } = req;
  const email = body.email;
  // await userService.login(body);
  // res
  //   .status(httpStatus.CREATED)
  //   .send({ status: true, message: "Login successful" });
  const user = await userModel.findOne({ email });
  if (user && (await bcrypt.compare(body.password, user.password))) {
    const token = jwt.sign(
      { name: user.name, email: user.email, userType: user.userType},
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // save user token
    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: "Login successful",
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        token: token,
        userType:user.userType
      },
    });
  } else {
    res.status(httpStatus.NOT_FOUND).send({
      status: httpStatus.NOT_FOUND,
      message: "Invalid Email or Password",
    });
  }
});

const register = catchAsync(async (req, res) => {
  const { body } = req;
  const encryptedPassword = await bcrypt.hash(req.body.password, 10);
  body.password = encryptedPassword;
  body.userType = "NA";
  userModel.create(body, (err, data) => {
    if (err) {
      if (err.code === 11000) {
        res
          .status(httpStatus.CONFLICT)
          .send({ status: httpStatus.CONFLICT, message: "Already registered" });
      } else {
        res
          .status(httpStatus.NOT_FOUND)
          .send({ status: httpStatus.NOT_FOUND, message: "Please try again" });
      }
    } else {
      res.status(httpStatus.CREATED).send({
        status: httpStatus.CREATED,
        message: "Registered Successfully",
        data: {
          name: data.name,
          email: data.email,
          mobile: data.mobile
        },
      });
    }
  });
});

module.exports = {
  login,
  register,
};
