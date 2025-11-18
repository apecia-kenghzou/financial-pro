const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: [true, 'Google ID is required'],
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: 'Please provide a valid email'
    }
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  picture: {
    type: String,
    default: ''
  },
  // OAuth tokens for accessing user's Google Sheets
  googleTokens: {
    accessToken: {
      type: String,
      required: true
    },
    refreshToken: {
      type: String,
      required: true
    },
    expiryDate: {
      type: Number
    }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });

// Update last login on save
UserSchema.pre('save', function(next) {
  if (this.isModified('googleTokens')) {
    this.lastLogin = Date.now();
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);
