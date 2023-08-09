require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const helmet = require("helmet");
const routes = require("./routes");
const keys = require("./config/keys");
const chalk = require("chalk");
const { errorConverter, errorHandler } = require("./middlewares/error");
const ApiError = require('./utils/ApiError');
const httpStatus = require('http-status');
const morgan = require('./utils/morgan');
const { database, port } = keys;


const app = express();
app.use(express.json({ limit: '4MB' }));
app.use('/uploads',express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(
    `${chalk.yellow("✓")} ${chalk.blue(
      `Listening on port ${port}. Visit http://localhost:${port}/ in your browser.`
    )}`
  );
});

app.use(morgan.successHandler);
app.use(morgan.errorHandler);

app.use(errorConverter);

// handle error
app.use(errorHandler);
app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: true,
  })
);
app.use(cors());
app.use(routes);



// Connect to MongoDB

mongoose
  .connect(database.url, {
    // useCreateIndex:true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
  })
  .then(() =>
    console.log(`${chalk.yellow("✓")} ${chalk.blue("MongoDB Connected!")}`)
  )
  .catch((err) => console.log(err));

// app.use(routes);



app.use(function(req,res){
  res.status(404).json({status:404,message:'Route Not Found'});
});
