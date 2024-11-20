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
  const { email, password } = req.body; // Use email and password fields

  try {
    // Find admin by email
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      // Admin not found
      return res.status(400).send("Invalid email or password");
    }

    // Compare the provided password with the hashed password in the DB
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      // Password does not match
      return res.status(400).send("Invalid email or password");
    }

    // Set session after successful login
    req.session.adminId = admin._id;
    
    // Optional: Store admin data in the session for later use
    req.session.admin = admin;

    // Redirect to dashboard after login
    res.redirect("/dashboard");

  } catch (error) {
    console.error("Login Error: ", error);
    res.status(500).send("Server error");
  }
});


// Admin registration page
router.get("/register", (req, res) => {
  res.render("register");
});

// Admin registration processing
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      email,
      password: hashedPassword,
    });

    await newAdmin.save();
    res.redirect('/');
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send('Server Error');
  }
});


// Admin dashboard
router.get("/dashboard", (req, res) => {
  if (!req.session.admin) return res.redirect("/");
  res.render("dashboard", { admin: req.session.admin });
});

// Admin profile page
router.get("/profile", (req, res) => {
  if (!req.session.admin) return res.redirect("/");
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
