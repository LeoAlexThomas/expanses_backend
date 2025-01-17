const express = require("express");
const router = express.Router();
const {
  getExpanses,
  getExpanse,
  createExpanse,
  updateExpanse,
  deleteExpanse,
} = require("../controllers/expanseController");
const validateToken = require("../middlewares/validateToken");

// Adding middleware to support private routes, This method will apply middleware to all of it's routes
// router.use(validateToken);

// 'router.route' => used to add route for our application api
router.route("/expanse/create").post(validateToken, createExpanse);

router.route("/expanse/all").get(validateToken, getExpanses);

router.route("/expanse/:id").get(validateToken, getExpanse);

router.route("/expanse/update/:id").put(validateToken, updateExpanse);

router.route("/expanse/delete/:id").delete(validateToken, deleteExpanse);

module.exports = router;
