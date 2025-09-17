const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [16, 'Age must be at least 16'],
    max: [100, 'Age must be less than or equal to 100']
  },
  major: {
    type: String,
    required: [true, 'Major is required'],
    trim: true
  },
  gpa: {
    type: Number,
    required: [true, 'GPA is required'],
    min: [0, 'GPA must be at least 0'],
    max: [4, 'GPA must be at most 4']
  },
  graduationYear: {
    type: Number,
    required: [true, 'Graduation year is required'],
    min: [new Date().getFullYear(), 'Graduation year must be current year or later']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
