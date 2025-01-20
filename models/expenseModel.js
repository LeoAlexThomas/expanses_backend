const mongoose = require("mongoose");

const ExpenseSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter a title"],
    },
    spent: {
      type: Number,
      required: [true, "Please enter a spent amount"],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    date: {
      type: String,
      required: [true, "Please enter a end date"],
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please give user id who is creating this expense"],
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Please give project id"],
    },
  },
  { timestamp: true }
);

module.exports = mongoose.model("Expense", ExpenseSchema);
