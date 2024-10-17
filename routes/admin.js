const express = require("express");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const router = express.Router();

// Admin login page
router.get("/", (req, res) => {
  res.render("login");
});

// Admin login authentication
router.post("/", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).send("Invalid credentials");

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).send("Invalid credentials");

    req.session.admin = admin; // Save admin to session
    res.redirect("/dashboard");
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Admin registration page
router.get("/register", (req, res) => {
  res.render("register");
});

// Admin registration processing
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if admin already exists
    let admin = await Admin.findOne({ email });
    if (admin) return res.status(400).send("Admin already exists");

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new admin
    admin = new Admin({
      email,
      password: hashedPassword,
    });

    await admin.save();
    res.redirect("/"); // Redirect to login after successful registration
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Admin dashboard
router.get("/dashboard", (req, res) => {
  if (!req.session.admin) return res.redirect("/login");
  res.render("dashboard", { admin: req.session.admin });
});

// Admin profile page
router.get("/profile", (req, res) => {
  if (!req.session.admin) return res.redirect("/login");
  res.render("profile", { admin: req.session.admin });
});

// Admin profile update
router.post("/profile/update", async (req, res) => {
  const { name, email, bio } = req.body;
  try {
    const admin = await Admin.findById(req.session.admin._id);
    admin.profile.name = name;
    admin.profile.email = email;
    admin.profile.bio = bio;
    await admin.save();
    req.session.admin = admin; // Update session data
    res.redirect("/profile");
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Admin logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;
