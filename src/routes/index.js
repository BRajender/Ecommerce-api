const express = require('express');
const userRoute = require('./user.route');
const productRoute = require('./product.route');
const router = express.Router();

const defaultRoutes = [
  {
    path: '/user',
    route: userRoute,
  },
  {
    path: '/product',
    route: productRoute,
  },
];

defaultRoutes.forEach(route => {
  router.use(route.path, route.route);
});

module.exports = router;
