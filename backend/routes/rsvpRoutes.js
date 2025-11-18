const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  submitRSVP,
  getRSVPsForCard,
  checkRSVP
} = require('../controllers/rsvpController');
const { rsvpValidation, cardIdValidation, validate } = require('../middleware/validation');

// Rate limiting for RSVP submission
const rsvpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 RSVP submissions per windowMs
  message: {
    success: false,
    message: 'Too many RSVP submissions, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Submit RSVP
router.post('/', rsvpLimiter, rsvpValidation, validate, submitRSVP);

// Get all RSVPs for a card
router.get('/card/:cardId', cardIdValidation, validate, getRSVPsForCard);

// Check if email has RSVP'd (changed to POST for security)
router.post('/check', [
  ...rsvpValidation.filter(v =>
    v._validations &&
    v._validations[0] &&
    (v._validations[0].field === 'cardId' || v._validations[0].field === 'email')
  )
], validate, checkRSVP);

module.exports = router;
