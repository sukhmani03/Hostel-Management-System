// Student model - stores student profile and room assignment info
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Link to the User account for authentication
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  course: {
    type: String,
    required: [true, 'Course is required'],
  },
  admissionDate: {
    type: Date,
    required: [true, 'Admission date is required'],
  },
  parentContact: {
    type: String,
  },
  profileImage: {
    type: String, // URL or base64 string
  },
  // Room assignment - null if not yet assigned
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null,
  },
  rollNumber: {
    type: String,
    unique: true,
    sparse: true, // allows multiple null values
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Student', studentSchema);
