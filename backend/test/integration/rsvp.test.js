const request = require('supertest');
const express = require('express');
const rsvpRoutes = require('../../routes/rsvpRoutes');
const InvitationCard = require('../../models/InvitationCard');
const RSVP = require('../../models/RSVP');
const User = require('../../models/User');
const { connect, closeDatabase, clearDatabase } = require('../testDbHelper');
const { mockUser, mockInvitationCard, mockRSVP } = require('../mockData');

// Mock Google Sheets integration
jest.mock('../../config/googleSheets', () => ({
  addRSVPToSheet: jest.fn().mockResolvedValue({ success: true }),
  initializeSheet: jest.fn().mockResolvedValue({ success: true })
}));

const createTestApp = (authenticatedUser = null) => {
  const app = express();
  app.use(express.json());

  if (authenticatedUser) {
    app.use((req, res, next) => {
      req.user = authenticatedUser;
      req.isAuthenticated = () => true;
      next();
    });
  }

  app.use('/api/rsvp', rsvpRoutes);
  return app;
};

describe('RSVP API Integration Tests', () => {
  let testUser;
  let testCard;

  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();

    // Create test user
    testUser = new User(mockUser);
    await testUser.save();

    // Create test invitation card (published)
    testCard = new InvitationCard({
      ...mockInvitationCard,
      creator: testUser._id,
      isPublished: true
    });
    await testCard.save();
  });

  describe('POST /api/rsvp/:cardId', () => {
    it('should submit RSVP for published invitation (no auth required)', async () => {
      const app = createTestApp(null);

      const response = await request(app)
        .post(`/api/rsvp/${testCard.cardId}`)
        .send(mockRSVP)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(mockRSVP.name);
      expect(response.body.data.email).toBe(mockRSVP.email);
      expect(response.body.data.cardId).toBe(testCard.cardId);

      // Verify RSVP was saved to database
      const savedRSVP = await RSVP.findOne({ cardId: testCard.cardId });
      expect(savedRSVP).toBeDefined();
      expect(savedRSVP.name).toBe(mockRSVP.name);
    });

    it('should return 404 for non-existent cardId', async () => {
      const app = createTestApp(null);

      const response = await request(app)
        .post('/api/rsvp/nonexistent')
        .send(mockRSVP)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should return 403 for unpublished invitation', async () => {
      const app = createTestApp(null);

      // Unpublish the card
      testCard.isPublished = false;
      await testCard.save();

      const response = await request(app)
        .post(`/api/rsvp/${testCard.cardId}`)
        .send(mockRSVP)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not published');
    });

    it('should validate required fields', async () => {
      const app = createTestApp(null);

      const invalidRSVP = {
        // Missing required fields
        email: 'test@example.com'
      };

      const response = await request(app)
        .post(`/api/rsvp/${testCard.cardId}`)
        .send(invalidRSVP)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate email format', async () => {
      const app = createTestApp(null);

      const invalidRSVP = {
        ...mockRSVP,
        email: 'not-an-email'
      };

      const response = await request(app)
        .post(`/api/rsvp/${testCard.cardId}`)
        .send(invalidRSVP)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should accept RSVP with attending=false', async () => {
      const app = createTestApp(null);

      const notAttendingRSVP = {
        ...mockRSVP,
        attending: false,
        numberOfGuests: 0
      };

      const response = await request(app)
        .post(`/api/rsvp/${testCard.cardId}`)
        .send(notAttendingRSVP)
        .expect(201);

      expect(response.body.data.attending).toBe(false);
    });

    it('should handle optional fields (phone, message)', async () => {
      const app = createTestApp(null);

      const minimalRSVP = {
        name: 'John Doe',
        email: 'john@example.com',
        numberOfGuests: 1,
        attending: true
        // No phone or message
      };

      const response = await request(app)
        .post(`/api/rsvp/${testCard.cardId}`)
        .send(minimalRSVP)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should try to add RSVP to Google Sheets if configured', async () => {
      const { addRSVPToSheet } = require('../../config/googleSheets');
      const app = createTestApp(null);

      await request(app)
        .post(`/api/rsvp/${testCard.cardId}`)
        .send(mockRSVP)
        .expect(201);

      // Verify Google Sheets integration was called
      expect(addRSVPToSheet).toHaveBeenCalled();
    });

    it('should still save RSVP even if Google Sheets sync fails', async () => {
      const { addRSVPToSheet } = require('../../config/googleSheets');
      addRSVPToSheet.mockRejectedValue(new Error('Sheets error'));

      const app = createTestApp(null);

      const response = await request(app)
        .post(`/api/rsvp/${testCard.cardId}`)
        .send(mockRSVP)
        .expect(201);

      expect(response.body.success).toBe(true);

      // Verify RSVP was still saved
      const savedRSVP = await RSVP.findOne({ cardId: testCard.cardId });
      expect(savedRSVP).toBeDefined();
    });
  });

  describe('GET /api/rsvp/:cardId', () => {
    beforeEach(async () => {
      // Create test RSVPs
      const rsvp1 = new RSVP({
        cardId: testCard.cardId,
        ...mockRSVP
      });
      await rsvp1.save();

      const rsvp2 = new RSVP({
        cardId: testCard.cardId,
        name: 'Jane Smith',
        email: 'jane@example.com',
        numberOfGuests: 3,
        attending: false
      });
      await rsvp2.save();
    });

    it('should return all RSVPs for a card when authenticated as creator', async () => {
      const app = createTestApp(testUser);

      const response = await request(app)
        .get(`/api/rsvp/${testCard.cardId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.total).toBe(2);
      expect(response.body.stats.attending).toBe(1);
      expect(response.body.stats.notAttending).toBe(1);
    });

    it('should return 401 when not authenticated', async () => {
      const app = createTestApp(null);

      await request(app)
        .get(`/api/rsvp/${testCard.cardId}`)
        .expect(401);
    });

    it('should return 403 when user is not the creator', async () => {
      // Create different user
      const otherUser = new User({
        ...mockUser,
        googleId: 'other-google-id',
        email: 'other@example.com'
      });
      await otherUser.save();

      const app = createTestApp(otherUser);

      const response = await request(app)
        .get(`/api/rsvp/${testCard.cardId}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('permission');
    });

    it('should calculate correct statistics', async () => {
      const app = createTestApp(testUser);

      const response = await request(app)
        .get(`/api/rsvp/${testCard.cardId}`)
        .expect(200);

      const { stats } = response.body;
      expect(stats.total).toBe(2);
      expect(stats.attending).toBe(1);
      expect(stats.notAttending).toBe(1);
      expect(stats.totalGuests).toBe(mockRSVP.numberOfGuests);
    });

    it('should return empty array when no RSVPs exist', async () => {
      await clearDatabase();

      // Recreate user and card
      testUser = new User(mockUser);
      await testUser.save();

      testCard = new InvitationCard({
        ...mockInvitationCard,
        creator: testUser._id,
        isPublished: true
      });
      await testCard.save();

      const app = createTestApp(testUser);

      const response = await request(app)
        .get(`/api/rsvp/${testCard.cardId}`)
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.stats.total).toBe(0);
    });
  });

  describe('RSVP Statistics', () => {
    beforeEach(async () => {
      // Create multiple RSVPs with different guest counts
      const rsvps = [
        { name: 'Person 1', email: 'p1@test.com', numberOfGuests: 2, attending: true },
        { name: 'Person 2', email: 'p2@test.com', numberOfGuests: 4, attending: true },
        { name: 'Person 3', email: 'p3@test.com', numberOfGuests: 1, attending: false },
        { name: 'Person 4', email: 'p4@test.com', numberOfGuests: 3, attending: true }
      ];

      for (const rsvpData of rsvps) {
        const rsvp = new RSVP({
          cardId: testCard.cardId,
          ...rsvpData
        });
        await rsvp.save();
      }
    });

    it('should calculate total guests correctly', async () => {
      const app = createTestApp(testUser);

      const response = await request(app)
        .get(`/api/rsvp/${testCard.cardId}`)
        .expect(200);

      const { stats } = response.body;
      expect(stats.total).toBe(4);
      expect(stats.attending).toBe(3);
      expect(stats.notAttending).toBe(1);
      expect(stats.totalGuests).toBe(2 + 4 + 3); // Only count attending guests
    });
  });
});
