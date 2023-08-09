const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const productCategorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const cartSchema = mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    status: {
      type: Boolean,
    }
  },
  { timestamps: true }
);

const ordersSchema = mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const productSchema = mongoose.Schema(
  { 
    productName: {
      type: String,
      required: true,
    },
    categoryId: {
      type: String,
      required: true,
    },
    productDescription: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
      // required: true,
    },
  },
  { timestamps: true }
);

// add plugin that converts mongoose to json
productCategorySchema.plugin(toJSON);
productSchema.plugin(toJSON);

// userSchema.index({ appointmentId: 1 });

const productCategoryModel = mongoose.model(
  "productCategory",
  productCategorySchema,
  "productCategory"
);
const productModel = mongoose.model("products", productSchema, "products");
const cartModel = mongoose.model("cart", cartSchema, "cart");
const orderModel = mongoose.model("orders", ordersSchema, "orders");

module.exports = { productCategoryModel, productModel, cartModel, orderModel};
