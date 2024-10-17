const express = require('express');
const router = express.Router();
const multer = require('multer');
const Blog = require('../models/Blog');
const Subtopic = require('../models/Subtopic');

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

// add subtopics 

// Route to render the 'Add Subtopic' page
router.get('/add-subtopic', (req, res) => {
  res.render('addSubtopic');
});

// Route to handle adding a new subtopic
router.post('/add-subtopic', async (req, res) => {
  const { category, subtopic } = req.body;
  
  try {
    const categoryBlogs = await Blog.find({ category });
    
    // Update each blog under the category with the new subtopic
    if (categoryBlogs.length > 0) {
      await Blog.updateMany(
        { category },
        { $addToSet: { subtopics: subtopic } } // Add subtopic if it's not already present
      );
    }
    
    res.redirect('/all-blogs');
  } catch (err) {
    res.status(500).send('Error adding subtopic');
  }
});

// subtopics

// Route to display add subtopic page for a specific category
router.get('/add-subtopic/:category', async (req, res) => {
  const category = req.params.category;
  const subtopics = await Subtopic.find({ category }); // Fetch subtopics for the category
  res.render('addSubtopic', { category, subtopics });
});

// Route to add a new subtopic
router.post('/add-subtopic/:category', async (req, res) => {
  const { subtopic } = req.body;
  const category = req.params.category;

  try {
    const newSubtopic = new Subtopic({ name: subtopic, category });
    await newSubtopic.save();
    res.redirect(`/add-subtopic/${category}`);
  } catch (err) {
    res.status(500).send('Error adding subtopic');
  }
});

// Route to edit a subtopic (GET)
router.get('/edit-subtopic/:id', async (req, res) => {
  const subtopic = await Subtopic.findById(req.params.id);
  res.render('editSubtopic', { subtopic });
});

// Route to update a subtopic (POST)
router.post('/edit-subtopic/:id', async (req, res) => {
  const { subtopic } = req.body;

  try {
    await Subtopic.findByIdAndUpdate(req.params.id, { name: subtopic });
    res.redirect(`/add-subtopic/${subtopic.category}`);
  } catch (err) {
    res.status(500).send('Error updating subtopic');
  }
});

// Route to delete a subtopic
router.post('/delete-subtopic/:id', async (req, res) => {
  await Subtopic.findByIdAndDelete(req.params.id);
  res.redirect(`/add-subtopic/${req.body.category}`); // Redirect back to the category page
});

module.exports = router;
