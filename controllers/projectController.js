const asyncHandler = require("express-async-handler");
const Project = require("../models/projectModel");
const lodash = require("lodash");

//@desc Get all projects
//@route GET /api/getProjects
//@access private
const getProjects = asyncHandler(async (req, res) => {
  try {
    const projects = await Project.find()
      .populate({
        path: "members",
        select: "_id name email", // NOTE: To populate selected fields only
      })
      .populate({
        path: "owner",
        select: "_id name email", // NOTE: To populate selected fields only
      })
      .populate("expanses");

    const currentProjects = projects
      .filter((project) => {
        return project.members.some((member) => {
          return member._id.toString() === req.user._id.toString();
        });
      })
      .map((project) => {
        const totalSpent = lodash.sum(project.expanses.map((exp) => exp.spent));
        return { ...project._doc, totalSpent: totalSpent };
      });

    res.status(200).json(currentProjects);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

//@desc Get project by id
//@route GET /api/project/:id
//@access private
const getProjectById = asyncHandler(async (req, res) => {
  try {
    const project = await Project.findById({ _id: req.params.id })
      .populate({
        path: "members",
        select: "_id name email", // NOTE: To populate selected fields only
      })
      .populate("owner")
      .populate("expanses");

    if (lodash.isNil(project)) {
      res.status(404);
      throw new Error("Project not found");
    }

    const totalSpent = lodash.sum(project.expanses.map((exp) => exp.spent));

    res.status(200).json({ ...project._doc, totalSpent: totalSpent });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

//@desc Create new project
//@route POST /api/getProjects
//@access private
const createProject = asyncHandler(async (req, res) => {
  try {
    if (lodash.isEmpty(req.body)) {
      res.status(400);
      throw new Error("All Fields are required");
    }
    const memberIds = req.body.members;
    const { user: currentUser } = req;
    if (memberIds.length > 9) {
      res.status(400);
      throw new Error("10 Members only allowed in a single project");
    }

    const project = await Project.create({
      ...req.body,
      owner: currentUser._id,
      members: [...memberIds, currentUser._id],
    });
    res.status(200).json({
      isSuccess: true,
      message: "Project created successfully created",
      data: project,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

//@desc Create new project
//@route PUT /api/getProjects
//@access private
const updateProject = asyncHandler(async (req, res) => {
  try {
    const { title, description, members } = req.body;
    const projectId = req.params.id;
    const { user: currentUser } = req;
    if (lodash.isNil(projectId) || lodash.isEmpty(projectId)) {
      res.status(400);
      throw new Error("Project id is required");
    }
    const currentProject = await Project.findByIdAndUpdate(
      projectId,
      { title, description, members: [...members, currentUser._id] },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      isSuccess: true,
      message: "Project updated successfully",
      data: currentProject,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

//@desc Delete specific project by id
//@route DELETE /api/project/delete/:id/
//@access private
const deleteProject = asyncHandler(async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("owner");
    if (project.owner._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error(
        "You don't have permission to delete other user's project"
      );
    }
    await Project.deleteOne({ _id: req.params.id });
    res
      .status(201)
      .json({ isSuccess: true, message: `Project deleted successfully` });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
};
