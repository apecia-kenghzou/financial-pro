const express = require('express');
const router = express.Router();
const {
  createInvitationCard,
  getInvitationCard,
  updateInvitationCard,
  publishInvitationCard,
  deleteInvitationCard,
  getAllInvitationCards
} = require('../controllers/invitationController');
const { invitationValidation, cardIdValidation, validate } = require('../middleware/validation');
const { isAuthenticated } = require('../middleware/auth');

// Protected routes (require authentication)
router.post('/', isAuthenticated, invitationValidation, validate, createInvitationCard);
router.get('/', isAuthenticated, getAllInvitationCards);
router.put('/:cardId', isAuthenticated, cardIdValidation, validate, updateInvitationCard);
router.post('/:cardId/publish', isAuthenticated, cardIdValidation, validate, publishInvitationCard);
router.delete('/:cardId', isAuthenticated, cardIdValidation, validate, deleteInvitationCard);

// Public route (no authentication required)
router.get('/:cardId', cardIdValidation, validate, getInvitationCard);

module.exports = router;
