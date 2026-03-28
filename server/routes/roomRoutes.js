// Room routes - CRUD operations for hostel rooms
const express = require('express');
const router = express.Router();
const { getAllRooms, getRoom, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAllRooms);
router.get('/:id', getRoom);
router.post('/', authorize('admin'), createRoom);
router.put('/:id', authorize('admin'), updateRoom);
router.delete('/:id', authorize('admin'), deleteRoom);

module.exports = router;
