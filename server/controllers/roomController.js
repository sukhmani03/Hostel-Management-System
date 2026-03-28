// Room controller - CRUD operations for hostel rooms
const Room = require('../models/Room');

/**
 * @desc    Get all rooms with optional filters
 * @route   GET /api/rooms
 * @access  Private
 */
const getAllRooms = async (req, res, next) => {
  try {
    const { status, type, isAC } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    // Convert string 'true'/'false' to boolean
    if (isAC !== undefined) filter.isAC = isAC === 'true';

    const rooms = await Room.find(filter);
    res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single room by ID
 * @route   GET /api/rooms/:id
 * @access  Private
 */
const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new room
 * @route   POST /api/rooms
 * @access  Private (admin)
 */
const createRoom = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, message: 'Room created successfully', data: room });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update room details
 * @route   PUT /api/rooms/:id
 * @access  Private (admin)
 */
const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.status(200).json({ success: true, message: 'Room updated successfully', data: room });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a room
 * @route   DELETE /api/rooms/:id
 * @access  Private (admin)
 */
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    await room.deleteOne();
    res.status(200).json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllRooms, getRoom, createRoom, updateRoom, deleteRoom };
