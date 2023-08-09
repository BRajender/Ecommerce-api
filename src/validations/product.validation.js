const Joi = require("joi");

const addProduct = {
  body: Joi.object().keys({
    productName: Joi.string().required(),
    categoryId: Joi.string().required(),
    productDescription: Joi.string().required(),
    price: Joi.string().required(),
    productImage: Joi.string().required(),
  }),
};

const getProducts = {
  body: Joi.object().keys({
    categoryId: Joi.string(),
    productId: Joi.string(),
  }),
};

const deleteProduct = {
  body: Joi.object().keys({
    productId: Joi.string(),
  }),
};

const editProduct = {
  body: Joi.object().keys({
    productId: Joi.string().required(),
    productName: Joi.string().required(),
    categoryId: Joi.string().required(),
    productDescription: Joi.string().required(),
    price: Joi.string().required(),
  }),
};

const addToCart = {
  body: Joi.object().keys({
    productId: Joi.string().required(),
    userId: Joi.string().required(),
    quantity: Joi.number().required(),
  }),
};

const deleteFromCart = {
  body: Joi.object().keys({
    productId: Joi.string().required(),
    userId: Joi.string().required(),
    quantity: Joi.number().required(),
  }),
};

const removeFromCart = {
  body: Joi.object().keys({
    productId: Joi.string().required(),
    userId: Joi.string().required(),
  }),
};

const checkout = {
  body: Joi.object().keys({
    productId: Joi.array().items(Joi.string()).required(),
    userId: Joi.string().required(),
    address: Joi.string().required(),
  }),
};

const fetchOrders = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
  }),
};

const search = {
  body: Joi.object().keys({
    searchTerm: Joi.string().required(),
    productCategory: Joi.string(),
  }),
};

const getCartDetails = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
  }),
};

const addProductCategory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

module.exports = {
  addProduct,
  getProducts,
  addToCart,
  search,
  checkout,
  fetchOrders,
  removeFromCart,
  getCartDetails,
  deleteFromCart,
  editProduct,
  deleteProduct,
  addProductCategory,
};
