// Student controller - CRUD operations and room assignment for students
const QRCode = require('qrcode');
const Student = require('../models/Student');
const Room = require('../models/Room');

/**
 * @desc    Get all students with optional search
 * @route   GET /api/students
 * @access  Private (admin/warden)
 */
const getAllStudents = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    // Search by name or email if search param provided
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const students = await Student.find(query).populate('roomId', 'roomNumber type floor rent');
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single student by ID
 * @route   GET /api/students/:id
 * @access  Private
 */
const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('roomId');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new student
 * @route   POST /api/students
 * @access  Private (admin)
 */
const createStudent = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({ success: true, message: 'Student created successfully', data: student });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update student details
 * @route   PUT /api/students/:id
 * @access  Private (admin)
 */
const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,       // Return updated document
      runValidators: true,
    });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, message: 'Student updated successfully', data: student });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a student
 * @route   DELETE /api/students/:id
 * @access  Private (admin)
 */
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // If student had a room, free up that bed
    if (student.roomId) {
      await Room.findByIdAndUpdate(student.roomId, {
        $inc: { occupiedBeds: -1 },
      });
    }

    await student.deleteOne();
    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign a room to a student
 * @route   PUT /api/students/:id/assign-room
 * @access  Private (admin)
 */
const assignRoom = async (req, res, next) => {
  try {
    const { roomId } = req.body;
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Check if there are available beds
    if (room.occupiedBeds >= room.totalBeds) {
      return res.status(400).json({ success: false, message: 'Room is fully occupied' });
    }

    // If student already had a different room, decrement that room's occupancy
    if (student.roomId && student.roomId.toString() !== roomId) {
      await Room.findByIdAndUpdate(student.roomId, { $inc: { occupiedBeds: -1 } });
    }

    // Update student's room assignment
    student.roomId = roomId;
    await student.save();

    // Increment occupied beds in the new room
    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { $inc: { occupiedBeds: 1 } },
      { new: true }
    );

    // Update room status based on occupancy
    if (updatedRoom.occupiedBeds >= updatedRoom.totalBeds) {
      updatedRoom.status = 'occupied';
    } else {
      updatedRoom.status = 'available';
    }
    await updatedRoom.save();

    res.status(200).json({ success: true, message: 'Room assigned successfully', data: student });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate a QR code for a student (contains student info)
 * @route   GET /api/students/:id/qr
 * @access  Private
 */
const generateQR = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('roomId', 'roomNumber floor');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Data to encode in the QR code
    const qrData = JSON.stringify({
      id: student._id,
      name: student.name,
      email: student.email,
      rollNumber: student.rollNumber,
      course: student.course,
      room: student.roomId ? student.roomId.roomNumber : 'Not Assigned',
    });

    // Generate QR code as a base64 data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrData);

    res.status(200).json({
      success: true,
      message: 'QR code generated successfully',
      data: { qrCode: qrCodeDataURL },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllStudents, getStudent, createStudent, updateStudent, deleteStudent, assignRoom, generateQR };
