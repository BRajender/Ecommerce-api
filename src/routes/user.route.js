const express = require("express");
const validate = require("../middlewares/validate");
const { authenticateToken } = require("../middlewares/auth");
const { userValidation } = require("../validations");
const { userController } = require("../controllers");

const router = express.Router();
router
  .route("/login")
  .post(validate(userValidation.login), userController.login);

router
  .route("/register")
  .post(validate(userValidation.register), userController.register);

module.exports = router;
