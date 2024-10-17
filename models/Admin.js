const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  email: { // Change username to email
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profile: {
    name: { type: String, default: "Admin" },
    email: { type: String, default: "" },
    bio: { type: String, default: "" },
  },
});

module.exports = mongoose.model("Admin", AdminSchema);
