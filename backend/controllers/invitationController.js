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
    const result = await initializeSheet(googleSheetId, req.user.googleTokens);
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

// Get invitation card by ID
const getInvitationCard = async (req, res) => {
  try {
    const { cardId } = req.params;

    const invitationCard = await InvitationCard.findOne({ cardId });

    if (!invitationCard) {
      return res.status(404).json({
        success: false,
        message: 'Invitation card not found'
      });
    }

    res.status(200).json({
      success: true,
      data: invitationCard
    });
  } catch (error) {
    console.error('Error fetching invitation card:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update invitation card
const updateInvitationCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { title, canvasData, eventDetails, googleSheetId } = req.body;

    const invitationCard = await InvitationCard.findOne({ cardId });

    if (!invitationCard) {
      return res.status(404).json({
        success: false,
        message: 'Invitation card not found'
      });
    }

    // Update fields
    if (title) invitationCard.title = title;
    if (canvasData) invitationCard.canvasData = canvasData;
    if (eventDetails) invitationCard.eventDetails = eventDetails;
    if (googleSheetId !== undefined) {
      invitationCard.googleSheetId = googleSheetId;
      if (googleSheetId) {
        await initializeSheet(googleSheetId);
      }
    }

    await invitationCard.save();

    res.status(200).json({
      success: true,
      data: invitationCard
    });
  } catch (error) {
    console.error('Error updating invitation card:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Publish invitation card
const publishInvitationCard = async (req, res) => {
  try {
    const { cardId } = req.params;

    const invitationCard = await InvitationCard.findOne({ cardId });

    if (!invitationCard) {
      return res.status(404).json({
        success: false,
        message: 'Invitation card not found'
      });
    }

    invitationCard.isPublished = true;
    await invitationCard.save();

    // Generate shareable link
    const shareableLink = `${process.env.FRONTEND_URL}/invitation/${cardId}`;

    res.status(200).json({
      success: true,
      data: {
        ...invitationCard.toObject(),
        shareableLink
      }
    });
  } catch (error) {
    console.error('Error publishing invitation card:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete invitation card
const deleteInvitationCard = async (req, res) => {
  try {
    const { cardId } = req.params;

    const invitationCard = await InvitationCard.findOneAndDelete({ cardId });

    if (!invitationCard) {
      return res.status(404).json({
        success: false,
        message: 'Invitation card not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Invitation card deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting invitation card:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all invitation cards (for admin/user dashboard)
const getAllInvitationCards = async (req, res) => {
  try {
    const invitationCards = await InvitationCard.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invitationCards.length,
      data: invitationCards
    });
  } catch (error) {
    console.error('Error fetching invitation cards:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createInvitationCard,
  getInvitationCard,
  updateInvitationCard,
  publishInvitationCard,
  deleteInvitationCard,
  getAllInvitationCards
};
