// Room model - stores hostel room details and availability
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    unique: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['single', 'double', 'triple'],
    required: [true, 'Room type is required'],
  },
  isAC: {
    type: Boolean,
    default: false,
  },
  totalBeds: {
    type: Number,
    required: [true, 'Total beds count is required'],
  },
  occupiedBeds: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance'],
    default: 'available',
  },
  floor: {
    type: Number,
  },
  rent: {
    type: Number,
    required: [true, 'Rent amount is required'],
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual field: calculate available beds on the fly
roomSchema.virtual('availableBeds').get(function () {
  return this.totalBeds - this.occupiedBeds;
});

// Include virtuals when converting to JSON
roomSchema.set('toJSON', { virtuals: true });
roomSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Room', roomSchema);
