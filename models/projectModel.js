const mongoose = require("mongoose");

const ProjectSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter a title"],
    },
    description: {
      type: String,
      default: null,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Please add a member to this project"],
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please add a owner to this project"],
    },
    expanses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Expanse",
      },
    ],
  },
  { timestamp: true }
);

// Add a default empty array to the expanses field
ProjectSchema.path("expanses").default(() => []);

module.exports = mongoose.model("Project", ProjectSchema);
