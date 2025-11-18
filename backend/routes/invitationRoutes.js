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

// Create new invitation card
router.post('/', invitationValidation, validate, createInvitationCard);

// Get all invitation cards
router.get('/', getAllInvitationCards);

// Get specific invitation card
router.get('/:cardId', cardIdValidation, validate, getInvitationCard);

// Update invitation card
router.put('/:cardId', cardIdValidation, validate, updateInvitationCard);

// Publish invitation card
router.post('/:cardId/publish', cardIdValidation, validate, publishInvitationCard);

// Delete invitation card
router.delete('/:cardId', cardIdValidation, validate, deleteInvitationCard);

module.exports = router;
