const express = require("express");
const router = express.Router();
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");
const validateToken = require("../middlewares/validateToken");

// Adding middleware to support private routes, This method will apply middleware to all of it's routes
// router.use(validateToken);

// 'router.route' => used to add route for our application api
router.route("/expense/create").post(validateToken, createExpense);

router.route("/expense/all").get(validateToken, getExpenses);

router.route("/expense/:id").get(validateToken, getExpense);

router.route("/expense/update/:id").put(validateToken, updateExpense);

router.route("/expense/delete/:id").delete(validateToken, deleteExpense);

module.exports = router;
