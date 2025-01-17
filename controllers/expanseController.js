const lodash = require("lodash");
const asyncHandler = require("express-async-handler");
const Expanse = require("../models/expanseModel");
const Project = require("../models/projectModel");
// NOTE: Adding asyncHandler to handle try/catch method and if exception is thrown it will be caught and handled in error handler we added in /functions/api.js file

//@desc Get all expanse
//@route GET /api/expanse/all/
//@access private
const getExpanses = asyncHandler(async (req, res) => {
  try {
    const expanses = await Expanse.find({ userId: req.user.id });
    const filteredExpanses = expanses.filter((expanse) => {
      const querySearch = req.query.searchText;
      return (
        lodash.isNil(querySearch) ||
        expanse.title.toLowerCase().includes(querySearch.toLowerCase())
      );
    });
    res.status(200).json(filteredExpanses);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

//@desc Get Specific expanse by id
//@route GET /api/expanse/:id/
//@access private
const getExpanse = asyncHandler(async (req, res) => {
  try {
    const expanse = await Expanse.findById({ _id: req.params.id }).populate({
      path: "owner",
      select: "_id name email",
    });
    if (!expanse) {
      res.status(404);
      throw new Error("Expanse not found");
    }
    res.status(200).json(expanse);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

//@desc Create expanse
//@route POST /api/expanse/create/
//@access private
const createExpanse = asyncHandler(async (req, res) => {
  const expanseData = req.body;
  if (lodash.isEmpty(expanseData)) {
    res.status(400);
    throw new Error("All fields are required");
  }
  // const session = await mongoose.startSession();
  // session.startTransaction();
  const project = await Project.findById({ _id: expanseData.projectId });
  if (lodash.isNil(project)) {
    res.status(400);
    throw new Error("Project not found");
  }
  try {
    const expanse = new Expanse({ ...expanseData, ownerId: req.user._id });
    await expanse.save();
    // const savedExpanse = expanse.save({ session });
    // await project.findByIdAndUpdate(
    //   expanseData.projectId,
    //   { $push: { expanses: savedExpanse._id } },
    //   { session }
    // );

    // await session.commitTransaction();
    // session.endSession();
    // const newExpanse = await Expanse.create({ ...expanseData, ownerId: req.user.id });
    project.expanses.push(expanse._id);
    await project.save();

    res.status(201).json({
      isSuccess: true,
      message: "Expanse created successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500);
    throw new Error(error);
  }
});

//@desc Update specific expanse by id
//@route PUT /api/expanse/update/:id/
//@access private
const updateExpanse = asyncHandler(async (req, res) => {
  try {
    const expanse = await Expanse.findById(req.params.id);
    if (!expanse) {
      res.status(404);
      throw new Error("Expanse not found");
    }
    if (expanse.ownerId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("User don't have permission to update others expanse");
    }

    await Expanse.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(201).json({
      isSuccess: true,
      message: `Expanse updated successfully`,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

//@desc Delete specific expanse by id
//@route DELETE /api/expanse/delete/:id/
//@access private
const deleteExpanse = asyncHandler(async (req, res) => {
  try {
    const expanse = await Expanse.findById(req.params.id);
    if (expanse.ownerId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("User don't have permission to delete others expanse");
    }
    await Expanse.deleteOne({ _id: req.params.id });
    res
      .status(201)
      .json({ isSuccess: true, message: `Expanse deleted successfully` });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

module.exports = {
  getExpanses,
  getExpanse,
  createExpanse,
  updateExpanse,
  deleteExpanse,
};
