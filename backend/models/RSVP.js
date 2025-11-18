const mongoose = require('mongoose');
const validator = require('validator');

const RSVPSchema = new mongoose.Schema({
  cardId: {
    type: String,
    required: [true, 'Card ID is required'],
    trim: true,
    index: true,
    minlength: [10, 'Card ID must be at least 10 characters'],
    maxlength: [10, 'Card ID must be exactly 10 characters']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [1, 'Name must be at least 1 character'],
    maxlength: [100, 'Name must be less than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: 'Please provide a valid email'
    }
  },
  phone: {
    type: String,
    default: '',
    trim: true,
    validate: {
      validator: function(v) {
        return !v || validator.isMobilePhone(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  numberOfGuests: {
    type: Number,
    default: 1,
    min: [1, 'Number of guests must be at least 1'],
    max: [20, 'Number of guests must not exceed 20']
  },
  attending: {
    type: Boolean,
    required: [true, 'Attending status is required']
  },
  message: {
    type: String,
    default: '',
    trim: true,
    maxlength: [500, 'Message must be less than 500 characters']
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Compound index for preventing duplicate RSVPs
RSVPSchema.index({ cardId: 1, email: 1 }, { unique: true });
RSVPSchema.index({ cardId: 1, createdAt: -1 });
RSVPSchema.index({ cardId: 1, attending: 1 });

module.exports = mongoose.model('RSVP', RSVPSchema);
