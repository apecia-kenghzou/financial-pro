const RSVP = require('../models/RSVP');
const InvitationCard = require('../models/InvitationCard');
const { addRSVPToSheet } = require('../config/googleSheets');

// Submit RSVP
const submitRSVP = async (req, res) => {
  try {
    const { cardId, name, email, phone, numberOfGuests, attending, message } = req.body;

    // Validate required fields
    if (!cardId || !name || !email || attending === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if invitation card exists and is published
    const invitationCard = await InvitationCard.findOne({ cardId, isPublished: true });

    if (!invitationCard) {
      return res.status(404).json({
        success: false,
        message: 'Invitation card not found or not published'
      });
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

    // Add to Google Sheets if configured
    if (invitationCard.googleSheetId) {
      const sheetResult = await addRSVPToSheet(invitationCard.googleSheetId, rsvp.toObject());
      if (!sheetResult.success) {
        console.warn('Failed to add RSVP to Google Sheets:', sheetResult.message || sheetResult.error);
      }
    }

    res.status(201).json({
      success: true,
      data: rsvp
    });
  } catch (error) {
    console.error('Error submitting RSVP:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all RSVPs for a card
const getRSVPsForCard = async (req, res) => {
  try {
    const { cardId } = req.params;

    const rsvps = await RSVP.find({ cardId }).sort({ submittedAt: -1 });

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
  } catch (error) {
    console.error('Error fetching RSVPs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Check if email has already RSVP'd
const checkRSVP = async (req, res) => {
  try {
    const { cardId, email } = req.params;

    const rsvp = await RSVP.findOne({ cardId, email });

    res.status(200).json({
      success: true,
      hasRSVP: !!rsvp,
      data: rsvp
    });
  } catch (error) {
    console.error('Error checking RSVP:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  submitRSVP,
  getRSVPsForCard,
  checkRSVP
};
