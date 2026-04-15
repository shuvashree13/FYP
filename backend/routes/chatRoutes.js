const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getOrCreateChat,
  getAllChats,
  sendMessage,
  markAsRead
} = require('../controllers/chatController');

// All routes are protected
router.use(protect);

router.get('/', getAllChats);
router.get('/:doctorId', getOrCreateChat);
router.post('/:chatId/messages', sendMessage);
router.put('/:chatId/read', markAsRead);

module.exports = router;