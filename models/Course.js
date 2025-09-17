const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  credits: {
    type: Number,
    required: [true, 'Credits is required'],
    min: [1, 'Credits must be at least 1'],
    max: [6, 'Credits must be at most 6']
  },
  instructor: {
    type: String,
    required: [true, 'Instructor is required'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
