const express = require("express");
const router = express.Router();
const {
  getCurrentUser,
  registerUser,
  loginUser,
  getAllUsers,
} = require("../controllers/userController");
const validateToken = require("../middlewares/validateToken");

// 'router.route' => used to add route for our application api
router.route("/user/register").post(registerUser);

// NOTE: To make one route as private add the validateToken middleware like below
router.route("/user/current").get(validateToken, getCurrentUser);

router.route("/user/login").post(loginUser);

router.route("/user/all").get(validateToken, getAllUsers);

module.exports = router;
