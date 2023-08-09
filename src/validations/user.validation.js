const Joi = require('joi');

const login = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
};

const register = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    mobile: Joi.string().length(10).pattern(/^[0-9]+$/),
    password: Joi.string().required(),
  }),
};

module.exports = {
  login,
  register
};
