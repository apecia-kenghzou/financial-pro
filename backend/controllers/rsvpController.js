const RSVP = require('../models/RSVP');
const InvitationCard = require('../models/InvitationCard');
const { addRSVPToSheet } = require('../config/googleSheets');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../config/logger');
const { NotFoundError } = require('../utils/errors');

// Submit RSVP (Public - no auth required)
const submitRSVP = asyncHandler(async (req, res) => {
  const { cardId, name, email, phone, numberOfGuests, attending, message } = req.body;

  // Check if invitation card exists and is published - POPULATE CREATOR!
  const invitationCard = await InvitationCard.findOne({ cardId, isPublished: true })
    .populate('creator');

  if (!invitationCard) {
    throw new NotFoundError('Invitation card not found or not published');
  }

  // Check if user already submitted RSVP
  const existingRSVP = await RSVP.findOne({ cardId, email });

  if (existingRSVP) {
    return res.status(400).json({
      success: false,
      message: 'You have already submitted an RSVP for this event'
    });
  }

  // Create RSVP
  const rsvp = new RSVP({
    cardId,
    name,
    email,
    phone: phone || '',
    numberOfGuests: numberOfGuests || 1,
    attending,
    message: message || ''
  });

  await rsvp.save();

  logger.info(`RSVP submitted for card ${cardId} by ${email}`);

  // Add to Google Sheets if configured - USE CREATOR'S TOKENS!
  if (invitationCard.googleSheetId && invitationCard.creator && invitationCard.creator.googleTokens) {
    try {
      const sheetResult = await addRSVPToSheet(
        invitationCard.googleSheetId,
        rsvp.toObject(),
        invitationCard.creator.googleTokens,  // <-- Creator's tokens, not guest's!
        invitationCard.creator._id.toString()  // <-- Pass creator ID for token refresh
      );

      if (!sheetResult.success) {
        logger.warn(`Failed to add RSVP to Google Sheets: ${sheetResult.message || sheetResult.error}`);
        // Don't fail the RSVP submission if sheet update fails
      } else {
        logger.info(`RSVP successfully added to Google Sheets for card ${cardId}`);
      }
    } catch (error) {
      logger.error(`Error adding RSVP to Google Sheets for card ${cardId}:`, error);
      // Don't fail the RSVP submission - sheet sync failure should not block RSVP
    }
  }

  res.status(201).json({
    success: true,
    data: rsvp
  });
});

// Get all RSVPs for a card (Protected - requires auth and ownership)
const getRSVPsForCard = asyncHandler(async (req, res) => {
  const { cardId } = req.params;

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Verify ownership
  const invitationCard = await InvitationCard.findOne({ cardId });

  if (!invitationCard) {
    throw new NotFoundError('Invitation card');
  }

  if (invitationCard.creator.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to view these RSVPs'
    });
  }

  const rsvps = await RSVP.find({ cardId }).sort({ createdAt: -1 });

  // Calculate statistics
  const stats = {
    total: rsvps.length,
    attending: rsvps.filter(r => r.attending).length,
    notAttending: rsvps.filter(r => !r.attending).length,
    totalGuests: rsvps.reduce((sum, r) => sum + (r.attending ? r.numberOfGuests : 0), 0)
  };

  res.status(200).json({
    success: true,
    data: rsvps,
    stats
  });
});

// Check if email has already RSVP'd (Public - no auth required)
const checkRSVP = asyncHandler(async (req, res) => {
  const { cardId, email } = req.body;

  const rsvp = await RSVP.findOne({ cardId, email });

  res.status(200).json({
    success: true,
    hasRSVP: !!rsvp,
    data: rsvp
  });
});

module.exports = {
  submitRSVP,
  getRSVPsForCard,
  checkRSVP
};
