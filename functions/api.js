const express = require("express");
const dotenv = require("dotenv").config();
const errorHandler = require("../middlewares/errorHandler");
const connectDB = require("../config/connectDB");
const cors = require("cors");
const serverless = require("serverless-http");

// NOTE: Initiate the connection to database
connectDB();

const app = express();

const port = process.env.PORT || 3002;

// 'app.use' => middleware

// This middleware is to support CORS error handling
app.use(
  cors({
    origin: ["https://basic-expanses.netlify.app/", "http://localhost:3000"],
  })
);

// Below line gives parser to help with data string parsed from client side on server side [get access to Request Body]
app.use(express.json());

app.options("*", cors()); // Enable preflight for all routes

// To add api routes for our application
app.use("/.netlify/functions/api", require("../routes/expanseRoutes"));
app.use("/.netlify/functions/api", require("../routes/userRoutes"));
app.use("/.netlify/functions/api", require("../routes/projectRoutes"));

// To add error handlers for structured error messages
app.use(errorHandler);

app.listen(port, () => {
  console.log("listening on port " + port);
});

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  const result = await handler(event, context);
  return result;
};
