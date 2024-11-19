const express = require('express');
const router = express.Router();
const multer = require('multer');
const Blog = require('../models/Blog');

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Route to render the 'Add Blog' page
router.get('/add-blog', (req, res) => {
  res.render('addBlog');
});

// Route to handle adding a new blog
router.post('/add-blog', upload.single('image'), async (req, res) => {
  const { title, category, content, author } = req.body;
  const image = req.file.filename; // Multer saves image in uploads/ folder
  

  try {
    const newBlog = new Blog({ title, category, content, image, author });
    await newBlog.save();
    res.redirect('/all-blogs');
  } catch (err) {
    res.status(500).send('Error saving blog');
  }
});

// Route to display all blogs categorized by headings
router.get('/all-blogs', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }); // Fetch blogs in descending order
    res.render('allBlogs', { blogs });
  } catch (err) {
    res.status(500).send('Error fetching blogs');
  }
});

// GET the edit blog form
router.get('/edit-blog/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  res.render('editBlog', { blog });
});

// POST to update blog
router.post('/edit-blog/:id', upload.single('image'), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    blog.title = req.body.title;
    blog.category = req.body.category;
    blog.content = req.body.content;

    if (req.file) {
      blog.image = req.file.filename; // Update image if provided
    }

    await blog.save();
    res.redirect('/all-blogs');
  } catch (err) {
    res.status(500).send('Error updating blog');
  }
});

// POST to delete blog
router.post('/delete-blog/:id', async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.redirect('/all-blogs');
});


module.exports = router;
