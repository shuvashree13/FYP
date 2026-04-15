const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderRole: {
    type: String,
    enum: ['patient', 'doctor'],
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  }
});

const chatSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  messages: [messageSchema],
  lastMessage: {
    type: String,
    trim: true
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    patient: {
      type: Number,
      default: 0
    },
    doctor: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
chatSchema.index({ patient: 1, doctor: 1 });
chatSchema.index({ lastMessageTime: -1 });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;