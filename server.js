const express = require("express");
const session = require("express-session");
const path = require("path");
const adminRoutes = require("./routes/admin");
const blogRoutes = require("./routes/blogRoutes");
const authRoutes = require("./routes/authRoutes");
const mongoose = require("mongoose");

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://sumitnyu9:lSkYWk97y6giRQio@cluster0.kxrqd.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected successfully"))
.catch((err) => console.log("MongoDB connection error: ", err));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
  })
);
// Serve the uploaded images
app.use('/uploads', express.static('uploads'));


// Set view engine
app.set("view engine", "ejs");

// Routes
app.use("/", adminRoutes);
app.use("/", blogRoutes);
app.use("/", authRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port localhost:${PORT}`);
});
