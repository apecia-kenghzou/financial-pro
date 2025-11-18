const InvitationCard = require('../models/InvitationCard');
const { nanoid } = require('nanoid');
const { initializeSheet } = require('../config/googleSheets');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../config/logger');
const { NotFoundError } = require('../utils/errors');

// Create a new invitation card
const createInvitationCard = asyncHandler(async (req, res) => {
  const { title, canvasData, eventDetails, googleSheetId } = req.body;

  // Ensure user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Generate unique card ID
  const cardId = nanoid(10);

  // If Google Sheet ID is provided, initialize it with headers using user's tokens
  if (googleSheetId && req.user.googleTokens) {
    const result = await initializeSheet(googleSheetId, req.user.googleTokens, req.user._id.toString());
    if (!result.success) {
      logger.warn(`Failed to initialize Google Sheet: ${result.error || result.message}`);
    }
  }

  const invitationCard = new InvitationCard({
    cardId,
    creator: req.user._id,
    title,
    canvasData,
    eventDetails,
    googleSheetId: googleSheetId || '',
    isPublished: false
  });

  await invitationCard.save();

  logger.info(`Invitation card created: ${cardId} by user: ${req.user.email}`);

  res.status(201).json({
    success: true,
    data: invitationCard
  });
});

// Get invitation card by ID (Public - no auth required)
const getInvitationCard = asyncHandler(async (req, res) => {
  const { cardId } = req.params;

  const invitationCard = await InvitationCard.findOne({ cardId }).populate('creator', 'name email picture');

  if (!invitationCard) {
    throw new NotFoundError('Invitation card');
  }

  res.status(200).json({
    success: true,
    data: invitationCard
  });
});

// Update invitation card (Protected - requires auth and ownership)
const updateInvitationCard = asyncHandler(async (req, res) => {
  const { cardId } = req.params;
  const { title, canvasData, eventDetails, googleSheetId } = req.body;

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const invitationCard = await InvitationCard.findOne({ cardId });

  if (!invitationCard) {
    throw new NotFoundError('Invitation card');
  }

  // Check ownership
  if (invitationCard.creator.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to update this invitation'
    });
  }

  // Update fields
  if (title) invitationCard.title = title;
  if (canvasData) invitationCard.canvasData = canvasData;
  if (eventDetails) invitationCard.eventDetails = eventDetails;
  if (googleSheetId !== undefined) {
    invitationCard.googleSheetId = googleSheetId;
    if (googleSheetId && req.user.googleTokens) {
      const result = await initializeSheet(googleSheetId, req.user.googleTokens, req.user._id.toString());
      if (!result.success) {
        logger.warn(`Failed to initialize Google Sheet: ${result.error || result.message}`);
      }
    }
  }

  await invitationCard.save();

  logger.info(`Invitation card updated: ${cardId} by user: ${req.user.email}`);

  res.status(200).json({
    success: true,
    data: invitationCard
  });
});

// Publish invitation card (Protected - requires auth and ownership)
const publishInvitationCard = asyncHandler(async (req, res) => {
  const { cardId } = req.params;

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const invitationCard = await InvitationCard.findOne({ cardId });

  if (!invitationCard) {
    throw new NotFoundError('Invitation card');
  }

  // Check ownership
  if (invitationCard.creator.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to publish this invitation'
    });
  }

  invitationCard.isPublished = true;
  await invitationCard.save();

  logger.info(`Invitation card published: ${cardId} by user: ${req.user.email}`);

  // Generate shareable link
  const shareableLink = `${process.env.FRONTEND_URL}/invitation/${cardId}`;

  res.status(200).json({
    success: true,
    data: {
      ...invitationCard.toObject(),
      shareableLink
    }
  });
});

// Delete invitation card (Protected - requires auth and ownership)
const deleteInvitationCard = asyncHandler(async (req, res) => {
  const { cardId } = req.params;

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const invitationCard = await InvitationCard.findOne({ cardId });

  if (!invitationCard) {
    throw new NotFoundError('Invitation card');
  }

  // Check ownership
  if (invitationCard.creator.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to delete this invitation'
    });
  }

  await InvitationCard.findOneAndDelete({ cardId });

  logger.info(`Invitation card deleted: ${cardId} by user: ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: 'Invitation card deleted successfully'
  });
});

// Get all invitation cards for current user (Protected - requires auth)
const getAllInvitationCards = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Only return cards created by the current user
  const invitationCards = await InvitationCard.find({ creator: req.user._id })
    .sort({ createdAt: -1 })
    .select('-__v');

  res.status(200).json({
    success: true,
    count: invitationCards.length,
    data: invitationCards
  });
});

module.exports = {
  createInvitationCard,
  getInvitationCard,
  updateInvitationCard,
  publishInvitationCard,
  deleteInvitationCard,
  getAllInvitationCards
};
