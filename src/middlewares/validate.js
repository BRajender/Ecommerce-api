const Joi = require("joi");
const httpStatus = require("http-status");
const pick = require("../utils/pick");

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ["params", "query", "body"]);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: "key" }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details
      .map((details) => details.message)
      .join(", ");
    return next(
      res
        .status(httpStatus.UNPROCESSABLE_ENTITY)
        .send({
          status: httpStatus.UNPROCESSABLE_ENTITY,
          message: errorMessage,
        })
    );
  }
  Object.assign(req, value);
  return next();
};

module.exports = validate;
