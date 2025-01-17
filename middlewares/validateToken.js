const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const lodash = require("lodash");
const User = require("../models/userModel");

const validateToken = asyncHandler(async (req, res, next) => {
  const headerToken = req.header.Authorization || req.headers.authorization;
  if (lodash.isNil(headerToken)) {
    res.status(401);
    throw new Error("User is not authorized");
  }
  const token = headerToken.split(" ")[1];
  await jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET_KEY,
    async (err, data) => {
      if (err) {
        res.status(401);
        throw new Error("User is not authorized");
      }
      const user = await User.findOne(
        { email: data.userEmail },
        { password: 0 }
      );
      if (lodash.isNil(user)) {
        res.status(404);
        throw new Error("User not found");
      }
      req.user = user;
      next();
    }
  );
});

module.exports = validateToken;
