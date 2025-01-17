const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const lodash = require("lodash");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// NOTE: Adding asyncHandler to handle try/catch method and if exception is thrown it will be caught and handled in error handler we added in /functions/api.js file

//@desc Register new user
//@route POST /api/user/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (
      lodash.isEmpty(name) ||
      lodash.isEmpty(email) ||
      lodash.isEmpty(password)
    ) {
      res.status(400);
      throw new Error("All Fields are required");
    }

    const userAvailability = await User.findOne({ email });
    if (!lodash.isNil(userAvailability)) {
      res.status(400);
      throw new Error("This email is already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await User.create({
      name,
      email,
      password: hashedPassword, // NOTE: Storing  hashed password instead of storing real password due user security issues
    });

    const accessToken = await getAccessToken({
      userId: createdUser.id,
      userEmail: createdUser.email,
    });

    res.status(200).json({
      isSuccess: true,
      message: "Registered successfully",
      data: {
        name: createdUser.name,
        email: createdUser.email,
        accessToken,
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

const getAccessToken = async (payload) => {
  return await jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: "30d",
  });
};

//@desc login user
//@route POST /api/user/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (lodash.isEmpty(email) || lodash.isEmpty(password)) {
      res.status(400);
      throw new Error("All Fields are required");
    }

    const user = await User.findOne({ email }); // NOTE: Max Timeout is 1 minute for this request
    if (lodash.isNil(user)) {
      res.status(404);
      throw new Error("Email is not registered");
    }

    if (!(await bcrypt.compare(password, user.password))) {
      res.status(401);
      throw new Error("Password is incorrect");
    }

    const accessToken = await getAccessToken({
      userId: user.id,
      userEmail: user.email,
    });
    res.status(200).json({
      isSuccess: true,
      message: "Logged in successfully",
      data: {
        accessToken,
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

//@desc Get current user
//@route GET /api/user/current
//@access private
const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    res.status(200).json({
      isSuccess: true,
      data: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

//@desc Get all user
//@route GET /api/user/all
//@access private
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const allUsers = await User.find();
    const { searchText } = req.query;
    const { user: currentUser } = req;
    const filteredUsers = allUsers.filter(
      (user) =>
        user.id !== currentUser.id &&
        (lodash.isNil(searchText) ||
          lodash.isEmpty(searchText) ||
          user.name.toLowerCase().includes(searchText.toLowerCase()))
    );
    res.status(200).json(filteredUsers);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

module.exports = { registerUser, loginUser, getCurrentUser, getAllUsers };
