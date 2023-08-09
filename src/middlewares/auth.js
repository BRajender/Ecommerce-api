const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");

exports.authenticateToken = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } else
      res
        .status(httpStatus.BAD_REQUEST)
        .send({ status: httpStatus.BAD_REQUEST, message: "Header Missing" });
  } catch (error) {
    if (error.response && error.response.status !== 200) {
      res
        .status(httpStatus.UNAUTHORIZED)
        .send({ status: httpStatus.UNAUTHORIZED, message: "Invalid Token" });
    } else {
      res
        .status(httpStatus.UNAUTHORIZED)
        .send({ status: httpStatus.UNAUTHORIZED, message: "Invalid Token" });
    }
  }
};

// exports.authenticateAdminToken = async (req, res, next) => {
//   try {
//     if (req.headers.authorization) {
//       const token = req.headers.authorization;
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       console.log(decoded.userType);
//       if (decoded.userType == "@dm!n") {
//         req.user = decoded;
//         next();
//       }
//       else{
//         res
//         .status(httpStatus.UNAUTHORIZED)
//         .send({ status: httpStatus.UNAUTHORIZED, message: "Invalid access" });
//       }
//     } else
//       res
//         .status(httpStatus.BAD_REQUEST)
//         .send({ status: httpStatus.BAD_REQUEST, message: "Header Missing" });
//   } catch (error) {
//     if (error.response && error.response.status !== 200) {
//       res
//         .status(httpStatus.UNAUTHORIZED)
//         .send({ status: httpStatus.UNAUTHORIZED, message: "Invalid Token" });
//     } else {
//       res
//         .status(httpStatus.UNAUTHORIZED)
//         .send({ status: httpStatus.UNAUTHORIZED, message: "Invalid Token" });
//     }
//   }
// };
