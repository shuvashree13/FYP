const Chat = require('../models/Chat');
const User = require('../models/User');

// @desc    Get or create chat between patient and doctor
// @route   GET /api/chats/:doctorId
// @access  Private (Patient/Doctor)
exports.getOrCreateChat = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const userId = req.user._id;
    
    let patientId, doctorIdToUse;
    
    if (req.user.role === 'patient') {
      patientId = userId;
      doctorIdToUse = doctorId;
    } else if (req.user.role === 'doctor') {
      patientId = doctorId; // When doctor initiates, doctorId is actually patientId
      doctorIdToUse = userId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only patients and doctors can access chat'
      });
    }

    // Find or create chat
    let chat = await Chat.findOne({
      patient: patientId,
      doctor: doctorIdToUse
    })
    .populate('patient', 'name email avatar role')
    .populate('doctor', 'name email avatar specialization role')
    .populate('messages.sender', 'name role');

    if (!chat) {
      chat = await Chat.create({
        patient: patientId,
        doctor: doctorIdToUse,
        messages: []
      });

      chat = await Chat.findById(chat._id)
        .populate('patient', 'name email avatar role')
        .populate('doctor', 'name email avatar specialization role');
    }

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('GetOrCreateChat error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all chats for current user
// @route   GET /api/chats
// @access  Private (Patient/Doctor)
exports.getAllChats = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only patients and doctors can access chats'
      });
    }

    const chats = await Chat.find(query)
      .populate('patient', 'name email avatar role')
      .populate('doctor', 'name email avatar specialization role')
      .sort({ lastMessageTime: -1 });

    res.status(200).json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('GetAllChats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Send message
// @route   POST /api/chats/:chatId/messages
// @access  Private (Patient/Doctor)
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify user is part of this chat
    if (
      chat.patient.toString() !== req.user._id.toString() &&
      chat.doctor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this chat'
      });
    }

    // Add message
    const newMessage = {
      sender: req.user._id,
      senderRole: req.user.role,
      message: message.trim(),
      timestamp: new Date(),
      isRead: false
    };

    chat.messages.push(newMessage);
    chat.lastMessage = message.trim();
    chat.lastMessageTime = new Date();

    // Increment unread count for the other user
    if (req.user.role === 'patient') {
      chat.unreadCount.doctor += 1;
    } else {
      chat.unreadCount.patient += 1;
    }

    await chat.save();

    // Populate sender info
    const updatedChat = await Chat.findById(chatId)
      .populate('patient', 'name email avatar role')
      .populate('doctor', 'name email avatar specialization role')
      .populate('messages.sender', 'name role');

    res.status(200).json({
      success: true,
      data: updatedChat
    });
  } catch (error) {
    console.error('SendMessage error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chats/:chatId/read
// @access  Private (Patient/Doctor)
exports.markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Reset unread count for current user
    if (req.user.role === 'patient') {
      chat.unreadCount.patient = 0;
    } else {
      chat.unreadCount.doctor = 0;
    }

    // Mark messages as read
    chat.messages.forEach(msg => {
      if (msg.sender.toString() !== req.user._id.toString()) {
        msg.isRead = true;
      }
    });

    await chat.save();

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('MarkAsRead error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};