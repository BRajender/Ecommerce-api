const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const multer = require("multer");
const mongoose = require("mongoose");
const mkdirp = require("mkdirp");
const path = require("path");
const {
  productCategoryModel,
  productModel,
  cartModel,
  orderModel,
} = require("../model/product.model");
const catchAsync = require("../utils/catchAsync");
const mime = require("mime");
const fs = require("fs");

const fetchCartCount = async (userId) => {
  const cartCount = await cartModel.find({ userId: userId });
  let count = 0;
  cartCount.map((data) => {
    count += data.quantity;
  });
  return count;
};

const addProductCategory = catchAsync(async (req, res) => {
  const { body } = req;
  const categoryName = body.name;
  productCategoryModel.findOne({ name: categoryName }).then((data) => {
    if (data) {
      res.status(httpStatus.CONFLICT).send({
        status: httpStatus.CONFLICT,
        message: "Product category already exist",
      });
    } else {
      productCategoryModel.create(req.body, (err, result) => {
        if (err) {
          res.status(httpStatus.CONFLICT).send({
            status: httpStatus.CONFLICT,
            message: "Please try again",
          });
        } else {
          res.status(httpStatus.CREATED).send({
            status: httpStatus.CREATED,
            message: "Product category added successfully",
          });
        }
      });
    }
  });
});

const checkout = catchAsync(async (req, res) => {
  const productIdArray = req.body.productId;
  const userId = req.body.userId;
  const userAddress = req.body.address;
  const checkoutArray = [];
  productIdArray.map((item) => {
    checkoutArray.push({
      productId: item,
      userId: userId,
      address: userAddress,
    });
  });

  orderModel
    .insertMany(checkoutArray)
    .then(async (success) => {
      cartModel.updateMany(
        {
          userId: userId,
          productId: { $in: productIdArray },
        },
        {
          $set: {
            status: true,
            quantity: 0,
          },
        },
        (err, data) => {
          if (err) {
            res.status(httpStatus.CONFLICT).send({
              status: httpStatus.CONFLICT,
              message: "Please try again",
            });
          } else {
            res.status(httpStatus.OK).send({
              status: httpStatus.OK,
              message: "Order added successfully",
            });
          }
        }
      );
    })
    .catch((error) => {
      res.status(httpStatus.CONFLICT).send({
        status: httpStatus.CONFLICT,
        message: "Please try again",
      });
    });
});

const search = catchAsync(async (req, res) => {
  const searchParam = req.body.searchTerm;
  if (req.body.productCategory) {
    productModel.find(
      {
        productName: { $regex: searchParam, $options: "i" },
        categoryId: req.body.productCategory,
      },
      (err, data) => {
        if (err) {
          res.status(httpStatus.CONFLICT).send({
            status: httpStatus.CONFLICT,
            message: "Please try again",
          });
        } else {
          if (data.length > 0) {
            res.status(httpStatus.OK).send({
              status: httpStatus.OK,
              data: data,
            });
          } else {
            res.status(httpStatus.NOT_FOUND).send({
              status: httpStatus.NOT_FOUND,
              message: "No product founds",
            });
          }
        }
      }
    );
  } else {
    productModel.find({ productName: { $regex: searchParam } }, (err, data) => {
      if (err) {
        res.status(httpStatus.CONFLICT).send({
          status: httpStatus.CONFLICT,
          message: "Please try again",
        });
      } else {
        if (data.length > 0) {
          res.status(httpStatus.OK).send({
            status: httpStatus.OK,
            data: data,
          });
        } else {
          res.status(httpStatus.NOT_FOUND).send({
            status: httpStatus.NOT_FOUND,
            message: "No product found",
          });
        }
      }
    });
  }
});

const getProductCategory = catchAsync(async (req, res) => {
  const productCategoryList = await productCategoryModel.find();

  if (productCategoryList.length > 0) {
    res.status(httpStatus.OK).send({
      status: httpStatus.OK,
      data: productCategoryList,
    });
  } else {
    res.status(httpStatus.NOT_FOUND).send({
      status: httpStatus.NOT_FOUND,
      message: "No product categories found",
    });
  }
});

const fetchOrders = catchAsync(async (req, res) => {
  const { body } = req;
  const userId = body.userId;

  orderModel.aggregate(
    [
      {
        $match: {
          $and: [{ userId: userId }],
        },
      },
      {
        $set: {
          productId: {
            $toObjectId: "$productId",
          },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "data",
        },
      },
      {
        $unwind: "$data",
      },
      {
        $addFields: {
          productName: "$data.productName",
          productPrice: "$data.price",
          productDescription: "$data.productDescription",
          productImage: "$data.productImage",
        },
      },
      {
        $project: {
          data: 0,
          __v: 0,
        },
      },
    ],
    function (err, result) {
      if (!err) {
        if (result.length > 0) {
          res.status(httpStatus.OK).send({
            status: httpStatus.OK,
            data: result,
          });
        } else {
          res.status(httpStatus.NOT_FOUND).send({
            status: httpStatus.NOT_FOUND,
            message: "No orders found",
          });
        }
      } else {
        res.status(httpStatus.NOT_FOUND).send({
          status: httpStatus.NOT_FOUND,
          message: "Please try again",
        });
      }
    }
  );

  // orderModel.find({ userId: userId }, (err, data) => {
  //   if (err) {
  //     res.status(httpStatus.CONFLICT).send({
  //       status: httpStatus.CONFLICT,
  //       message: "Please try again",
  //     });
  //   } else {
  //     if (data.length > 0) {
  //       res.status(httpStatus.OK).send({
  //         status: httpStatus.OK,
  //         data: data,
  //       });
  //     } else {
  //       res.status(httpStatus.NOT_FOUND).send({
  //         status: httpStatus.NOT_FOUND,
  //         message: "No orders found",
  //       });
  //     }
  //   }
  // });
});

const deleteProduct = catchAsync(async (req, res) => {
  const { body } = req;
  const productId = body.productId;
  const deleteProductbyId = await productModel.findOneAndDelete({
    _id: mongoose.Types.ObjectId(productId),
  });
  if (deleteProductbyId) {
    res.status(httpStatus.OK).send({
      status: httpStatus.OK,
      message: "Product deleted successfully",
    });
  } else {
    res.status(httpStatus.NOT_FOUND).send({
      status: httpStatus.NOT_FOUND,
      message: "Product does not exist",
    });
  }
});

const removeFromCart = catchAsync(async (req, res) => {
  const { body } = req;
  const productId = body.productId;
  const userId = body.userId;
  const removeProductFromCart = await cartModel.findOneAndDelete({
    productId: productId,
    userId: userId,
  });
  if (removeProductFromCart) {
    const totalProductsInCart = await fetchCartCount(userId);
    res.status(httpStatus.OK).send({
      status: httpStatus.OK,
      message: "Removed from cart successfully",
      totalProductsInCart: totalProductsInCart,
    });
  } else {
    res.status(httpStatus.NOT_FOUND).send({
      status: httpStatus.NOT_FOUND,
      message: "Product does not exist in cart",
    });
  }
});

const addToCart = catchAsync(async (req, res) => {
  const { body } = req;
  const productId = body.productId;
  const userId = body.userId;
  const quantity = body.quantity;
  body.status = false;
  const productCart = await cartModel.findOne({
    productId: productId,
    userId: userId,
  });

  if (productCart) {
    productCart.quantity = productCart.quantity + body.quantity;
    productCart.status = false;
    productCart.save(async (err, doc) => {
      if (err) {
        res.status(httpStatus.CONFLICT).send({
          status: httpStatus.CONFLICT,
          message: "Please try again",
        });
      } else {
        const totalProductsInCart = await fetchCartCount(userId);
        res.status(httpStatus.OK).send({
          status: httpStatus.OK,
          message: "Product added to cart",
          totalProductsInCart,
        });
      }
    });
  } else {
    cartModel.create(body, async (err, data) => {
      if (err) {
        res.status(httpStatus.CONFLICT).send({
          status: httpStatus.CONFLICT,
          message: "Please try again",
        });
      } else {
        const totalProductsInCart = await fetchCartCount(userId);
        res.status(httpStatus.OK).send({
          status: httpStatus.OK,
          message: "Product added to cart",
          totalProductsInCart: totalProductsInCart,
        });
      }
    });
  }
});

const getCartDetails = catchAsync(async (req, res) => {
  const { body } = req;
  const userId = body.userId;
  const totalProductsInCart = await fetchCartCount(userId);
  const cartDetails = cartModel
    .aggregate(
      [
        {
          $match: {
            $and: [
              { userId: userId },
              { status: { $ne: true } },
              { quantity: { $ne: 0 } },
            ],
          },
        },
        {
          $set: {
            productId: {
              $toObjectId: "$productId",
            },
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "data",
          },
        },
        {
          $unwind: "$data",
        },
        {
          $addFields: {
            productName: "$data.productName",
            productPrice: "$data.price",
            productDescription: "$data.productDescription",
          },
        },
        {
          $project: {
            data: 0,
            __v: 0,
          },
        },
      ],
      function (err, result) {
        if (!err) {
          if (result.length > 0) {
            result.map((item) => {
              item.totalPrice =
                parseInt(item.quantity) * parseInt(item.productPrice);
            });
            res.status(httpStatus.OK).send({
              status: httpStatus.OK,
              totalProductsInCart: totalProductsInCart,
              data: result,
            });
          } else {
            res.status(httpStatus.NOT_FOUND).send({
              status: httpStatus.NOT_FOUND,
              message: "No products found in cart",
            });
          }
        } else {
          res.status(httpStatus.NOT_FOUND).send({
            status: httpStatus.NOT_FOUND,
            message: "Please try again",
          });
        }
      }
    )
    .allowDiskUse(true);
});

const deleteFromCart = catchAsync(async (req, res) => {
  const { body } = req;
  const productId = body.productId;
  const userId = body.userId;
  const quantity = body.quantity;
  const productCart = await cartModel.findOne({
    productId: productId,
    userId: userId,
  });

  if (productCart) {
    if (productCart.quantity > 0 && productCart.quantity >= body.quantity) {
      productCart.quantity = productCart.quantity - body.quantity;
      productCart.save(async (err, doc) => {
        if (err) {
          res.status(httpStatus.CONFLICT).send({
            status: httpStatus.CONFLICT,
            message: "Please try again",
          });
        } else {
          const totalProductsInCart = await fetchCartCount(userId);
          res.status(httpStatus.OK).send({
            status: httpStatus.OK,
            message: "Product quantity reduced from cart",
            totalProductsInCart: totalProductsInCart,
          });
        }
      });
    } else {
      res.status(httpStatus.CONFLICT).send({
        status: httpStatus.CONFLICT,
        message: "Please try again",
      });
    }
  } else {
    res.status(httpStatus.CONFLICT).send({
      status: httpStatus.CONFLICT,
      message: "Product not in cart",
    });
  }
});

const getProducts = catchAsync(async (req, res) => {
  const { body } = req;
  if (req.body.categoryId) {
    const categoryId = body.categoryId;
    await productModel.find({ categoryId: categoryId }).then((data) => {
      if (data.length > 0) {
        res.status(httpStatus.OK).send({
          status: httpStatus.OK,
          data: data,
        });
      } else {
        res.status(httpStatus.NOT_FOUND).send({
          status: httpStatus.NOT_FOUND,
          message: "No products found",
        });
      }
    });
  } else if (req.body.productId) {
    const productId = body.productId;
    await productModel
      .find({ _id: mongoose.Types.ObjectId(productId) })
      .then((data) => {
        if (data.length > 0) {
          res.status(httpStatus.OK).send({
            status: httpStatus.OK,
            data: data,
          });
        } else {
          res.status(httpStatus.NOT_FOUND).send({
            status: httpStatus.NOT_FOUND,
            message: "No products found",
          });
        }
      });
  } else {
    await productModel.find().then((data) => {
      if (data.length > 0) {
        res.status(httpStatus.OK).send({
          status: httpStatus.OK,
          data: data,
        });
      } else {
        res.status(httpStatus.NOT_FOUND).send({
          status: httpStatus.NOT_FOUND,
          message: "No products found",
        });
      }
    });
  }
});

const addProduct = catchAsync(async (req, res) => {
  if (
    req.body.productName &&
    req.body.categoryId &&
    req.body.productDescription &&
    req.body.price &&
    req.file.filename
  ) {
    const data = {
      productName: req.body.productName,
      categoryId: req.body.categoryId,
      productDescription: req.body.productDescription,
      price: req.body.price,
      productImage: req.file.filename,
    };
    const categoryId = req.body.categoryId;
    const findProductCategory = await productCategoryModel.findById(categoryId);
    if (findProductCategory) {
      productModel.create(data, (err, result) => {
        if (err) {
          res.status(httpStatus.CONFLICT).send({
            status: httpStatus.CONFLICT,
            message: "Please try again",
          });
        } else {
          res.status(httpStatus.CREATED).send({
            status: httpStatus.CREATED,
            message: "Product added successfully",
          });
        }
      });
    } else {
      res.status(httpStatus.CONFLICT).send({
        status: httpStatus.CONFLICT,
        message: "Invalid Product Category",
      });
    }
  } else {
    res.status(httpStatus.CONFLICT).send({
      status: httpStatus.CONFLICT,
      message: "Invalid request",
    });
  }
});

const editProduct = catchAsync(async (req, res) => {
  const { body } = req;
  const productId = body.productId;

  if (
    req.body.productName &&
    req.body.categoryId &&
    req.body.productDescription &&
    req.body.price &&
    req.body.productId
  ) {
    const data = {
      productName: req.body.productName,
      categoryId: req.body.categoryId,
      productDescription: req.body.productDescription,
      price: req.body.price,
      productId: req.body.productId,
    };

    productModel.findOne(
      { _id: mongoose.Types.ObjectId(data.productId) },
      async (err, docs) => {
        if (docs) {
          docs.productName = req.body.productName;
          docs.categoryId = req.body.categoryId;
          docs.productDescription = req.body.productDescription;
          docs.price = req.body.price;
          if (req.file) {
            docs.productImage = req.file.filename;
          }
          docs.save();
          res.status(httpStatus.OK).send({
            status: httpStatus.OK,
            message: "Product updated successfully",
          });
        } else {
          res.status(httpStatus.CONFLICT).send({
            status: httpStatus.CONFLICT,
            message: "Please try again",
          });
        }
      }
    );
  } else {
    res.status(httpStatus.CONFLICT).send({
      status: httpStatus.CONFLICT,
      message: "Invalid request",
    });
  }
});

module.exports = {
  addProduct,
  getProducts,
  addToCart,
  search,
  fetchOrders,
  checkout,
  removeFromCart,
  getCartDetails,
  deleteFromCart,
  getProductCategory,
  editProduct,
  deleteProduct,
  addProductCategory,
};
