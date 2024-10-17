const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String, // Will store the path of the uploaded image
    required: true
  },
  author: {
    type: String, // or you can use mongoose.Schema.Types.ObjectId if you want to reference a User model
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;
