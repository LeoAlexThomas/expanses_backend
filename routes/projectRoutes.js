const express = require("express");
const router = express.Router();
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");
const validateToken = require("../middlewares/validateToken");

router.route("/project/all").get(validateToken, getProjects);

router.route("/project/:id").get(validateToken, getProjectById);

router.route("/project/update/:id").put(validateToken, updateProject);

router.route("/project/delete/:id").delete(validateToken, deleteProject);

router.route("/project/create").post(validateToken, createProject);

module.exports = router;
