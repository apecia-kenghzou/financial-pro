const InvitationCard = require('../models/InvitationCard');
const { nanoid } = require('nanoid');
const { initializeSheet } = require('../config/googleSheets');

// Create a new invitation card
const createInvitationCard = async (req, res) => {
  try {
    const { title, canvasData, eventDetails, googleSheetId } = req.body;

    // Validate required fields
    if (!title || !canvasData || !eventDetails) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, canvas data, and event details'
      });
    }

    // Generate unique card ID
    const cardId = nanoid(10);

    // If Google Sheet ID is provided, initialize it with headers
    if (googleSheetId) {
      await initializeSheet(googleSheetId);
    }

    const invitationCard = new InvitationCard({
      cardId,
      title,
      canvasData,
      eventDetails,
      googleSheetId: googleSheetId || '',
      isPublished: false
    });

    await invitationCard.save();

    res.status(201).json({
      success: true,
      data: invitationCard
    });
  } catch (error) {
    console.error('Error creating invitation card:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

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
