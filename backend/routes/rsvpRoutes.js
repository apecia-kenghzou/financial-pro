const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const {
  submitRSVP,
  getRSVPsForCard,
  checkRSVP
} = require('../controllers/rsvpController');
const { rsvpValidation, cardIdValidation, validate } = require('../middleware/validation');
const { isAuthenticated } = require('../middleware/auth');

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

// Public routes (no authentication required)
router.post('/', rsvpLimiter, rsvpValidation, validate, submitRSVP);
router.post('/check', [
  body('cardId').trim().notEmpty().isLength({ min: 10, max: 10 }),
  body('email').trim().isEmail().normalizeEmail()
], validate, checkRSVP);

// Protected route (requires authentication and ownership)
router.get('/card/:cardId', isAuthenticated, cardIdValidation, validate, getRSVPsForCard);

module.exports = router;
