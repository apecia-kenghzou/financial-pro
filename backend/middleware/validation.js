const { body, param, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Invitation card validation
const invitationValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('canvasData')
    .notEmpty()
    .withMessage('Canvas data is required')
    .isObject()
    .withMessage('Canvas data must be an object'),
  body('eventDetails.location')
    .trim()
    .notEmpty()
    .withMessage('Event location is required')
    .isLength({ max: 500 })
    .withMessage('Location must be less than 500 characters'),
  body('eventDetails.dateTime')
    .notEmpty()
    .withMessage('Event date and time is required')
    .isISO8601()
    .toDate()
    .withMessage('Invalid date format'),
  body('eventDetails.description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('googleSheetId')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Google Sheet ID must be less than 200 characters')
];

// RSVP validation
const rsvpValidation = [
  body('cardId')
    .trim()
    .notEmpty()
    .withMessage('Card ID is required')
    .isLength({ min: 10, max: 10 })
    .withMessage('Invalid card ID'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Invalid phone number'),
  body('numberOfGuests')
    .optional()
    .isInt({ min: 1, max: 20 })
    .toInt()
    .withMessage('Number of guests must be between 1 and 20'),
  body('attending')
    .notEmpty()
    .withMessage('Attending status is required')
    .isBoolean()
    .withMessage('Attending must be a boolean'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message must be less than 500 characters')
];

// Card ID parameter validation
const cardIdValidation = [
  param('cardId')
    .trim()
    .isLength({ min: 10, max: 10 })
    .withMessage('Invalid card ID')
];

module.exports = {
  validate,
  invitationValidation,
  rsvpValidation,
  cardIdValidation
};
