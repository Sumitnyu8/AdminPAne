const mongoose = require('mongoose');

const subtopicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }
});

module.exports = mongoose.model('Subtopic', subtopicSchema);
