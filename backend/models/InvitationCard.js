const mongoose = require('mongoose');

const InvitationCardSchema = new mongoose.Schema({
  cardId: {
    type: String,
    required: [true, 'Card ID is required'],
    unique: true,
    index: true,
    trim: true,
    minlength: [10, 'Card ID must be at least 10 characters'],
    maxlength: [10, 'Card ID must be exactly 10 characters']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character'],
    maxlength: [200, 'Title must be less than 200 characters']
  },
  canvasData: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Canvas data is required'],
    validate: {
      validator: function(v) {
        return v && typeof v === 'object' && !Array.isArray(v);
      },
      message: 'Canvas data must be a valid object'
    }
  },
  eventDetails: {
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
      maxlength: [500, 'Location must be less than 500 characters']
    },
    dateTime: {
      type: Date,
      required: [true, 'Event date and time is required'],
      validate: {
        validator: function(v) {
          return v instanceof Date && !isNaN(v);
        },
        message: 'Invalid date format'
      }
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Description must be less than 2000 characters']
    }
  },
  googleSheetId: {
    type: String,
    default: '',
    trim: true,
    maxlength: [200, 'Google Sheet ID must be less than 200 characters']
  },
  isPublished: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Compound indexes for common queries
InvitationCardSchema.index({ isPublished: 1, createdAt: -1 });
InvitationCardSchema.index({ createdAt: -1 });

module.exports = mongoose.model('InvitationCard', InvitationCardSchema);
