const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  // Add any other school-specific information here
});

const School = mongoose.model('School', schoolSchema);

module.exports = School;