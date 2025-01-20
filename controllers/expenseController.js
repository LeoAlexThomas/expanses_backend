const lodash = require("lodash");
const asyncHandler = require("express-async-handler");
const Expense = require("../models/expenseModel");
const Project = require("../models/projectModel");
// NOTE: Adding asyncHandler to handle try/catch method and if exception is thrown it will be caught and handled in error handler we added in /functions/api.js file

//@desc Get all expense
//@route GET /api/expense/all/
//@access private
const getExpenses = asyncHandler(async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id });
    const filteredExpenses = expenses.filter((expense) => {
      const querySearch = req.query.searchText;
      return (
        lodash.isNil(querySearch) ||
        expense.title.toLowerCase().includes(querySearch.toLowerCase())
      );
    });
    res.status(200).json(filteredExpenses);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

//@desc Get Specific expense by id
//@route GET /api/expense/:id/
//@access private
const getExpense = asyncHandler(async (req, res) => {
  try {
    const expense = await Expense.findById({ _id: req.params.id }).populate({
      path: "owner",
      select: "_id name email",
    });
    if (!expense) {
      res.status(404);
      throw new Error("Expense not found");
    }
    res.status(200).json(expense);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

//@desc Create expense
//@route POST /api/expense/create/
//@access private
const createExpense = asyncHandler(async (req, res) => {
  const expenseData = req.body;
  if (lodash.isEmpty(expenseData)) {
    res.status(400);
    throw new Error("All fields are required");
  }
  // const session = await mongoose.startSession();
  // session.startTransaction();
  const project = await Project.findById({ _id: expenseData.projectId });
  if (lodash.isNil(project)) {
    res.status(400);
    throw new Error("Project not found");
  }
  try {
    const expense = new Expense({ ...expenseData, ownerId: req.user._id });
    await expense.save();
    // const savedExpense = expense.save({ session });
    // await project.findByIdAndUpdate(
    //   expenseData.projectId,
    //   { $push: { expenses: savedExpense._id } },
    //   { session }
    // );

    // await session.commitTransaction();
    // session.endSession();
    // const newExpense = await Expense.create({ ...expenseData, ownerId: req.user.id });
    project.expenses.push(expense._id);
    await project.save();

    res.status(201).json({
      isSuccess: true,
      message: "Expense created successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500);
    throw new Error(error);
  }
});

//@desc Update specific expense by id
//@route PUT /api/expense/update/:id/
//@access private
const updateExpense = asyncHandler(async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      res.status(404);
      throw new Error("Expense not found");
    }
    if (expense.ownerId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("User don't have permission to update others expense");
    }

    await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(201).json({
      isSuccess: true,
      message: `Expense updated successfully`,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

//@desc Delete specific expense by id
//@route DELETE /api/expense/delete/:id/
//@access private
const deleteExpense = asyncHandler(async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (expense.ownerId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("User don't have permission to delete others expense");
    }
    await Expense.deleteOne({ _id: req.params.id });
    res
      .status(201)
      .json({ isSuccess: true, message: `Expense deleted successfully` });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

module.exports = {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
};
