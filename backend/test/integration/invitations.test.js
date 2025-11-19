const request = require('supertest');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const invitationRoutes = require('../../routes/invitationRoutes');
const InvitationCard = require('../../models/InvitationCard');
const User = require('../../models/User');
const { connect, closeDatabase, clearDatabase } = require('../testDbHelper');
const { mockUser, mockInvitationCard } = require('../mockData');
const { nanoid } = require('nanoid');

// Create test app with authentication middleware
const createTestApp = (authenticatedUser = null) => {
  const app = express();
  app.use(express.json());
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  // Mock authentication middleware
  if (authenticatedUser) {
    app.use((req, res, next) => {
      req.user = authenticatedUser;
      req.isAuthenticated = () => true;
      next();
    });
  }

  app.use('/api/invitations', invitationRoutes);
  return app;
};

describe('Invitations API Integration Tests', () => {
  let testUser;

  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    testUser = new User(mockUser);
    await testUser.save();
  });

  describe('POST /api/invitations', () => {
    it('should create a new invitation card when authenticated', async () => {
      const app = createTestApp(testUser);

      const newCard = {
        title: 'Test Birthday Party',
        canvasData: { elements: [] },
        eventDetails: {
          location: 'Test Location',
          dateTime: new Date('2025-12-31'),
          description: 'Test description'
        },
        googleSheetId: 'test-sheet-id'
      };

      const response = await request(app)
        .post('/api/invitations')
        .send(newCard)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(newCard.title);
      expect(response.body.data.cardId).toBeDefined();
      expect(response.body.data.cardId).toHaveLength(10);
      expect(response.body.data.isPublished).toBe(false);
    });

    it('should return 401 when not authenticated', async () => {
      const app = createTestApp(null);

      const newCard = {
        title: 'Test Party',
        canvasData: { elements: [] },
        eventDetails: {
          location: 'Test',
          dateTime: new Date(),
          description: ''
        }
      };

      const response = await request(app)
        .post('/api/invitations')
        .send(newCard)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const app = createTestApp(testUser);

      const invalidCard = {
        title: 'Test',
        // Missing canvasData and eventDetails
      };

      const response = await request(app)
        .post('/api/invitations')
        .send(invalidCard)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle duplicate cardId by retrying', async () => {
      const app = createTestApp(testUser);

      const newCard = {
        title: 'Test Party',
        canvasData: { elements: [] },
        eventDetails: {
          location: 'Test',
          dateTime: new Date('2025-12-31'),
          description: ''
        }
      };

      // Create first card
      await request(app)
        .post('/api/invitations')
        .send(newCard)
        .expect(201);

      // Create second card (should get different ID)
      const response = await request(app)
        .post('/api/invitations')
        .send(newCard)
        .expect(201);

      expect(response.body.data.cardId).toBeDefined();
    });
  });

  describe('GET /api/invitations', () => {
    beforeEach(async () => {
      // Create test cards
      const card1 = new InvitationCard({
        ...mockInvitationCard,
        cardId: nanoid(10),
        creator: testUser._id,
        isPublished: true
      });
      await card1.save();

      const card2 = new InvitationCard({
        ...mockInvitationCard,
        cardId: nanoid(10),
        creator: testUser._id,
        isPublished: false
      });
      await card2.save();
    });

    it('should return all user invitations when authenticated', async () => {
      const app = createTestApp(testUser);

      const response = await request(app)
        .get('/api/invitations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });

    it('should return 401 when not authenticated', async () => {
      const app = createTestApp(null);

      await request(app)
        .get('/api/invitations')
        .expect(401);
    });
  });

  describe('GET /api/invitations/:cardId', () => {
    let testCard;

    beforeEach(async () => {
      testCard = new InvitationCard({
        ...mockInvitationCard,
        creator: testUser._id
      });
      await testCard.save();
    });

    it('should return invitation by cardId', async () => {
      const app = createTestApp(testUser);

      const response = await request(app)
        .get(`/api/invitations/${testCard.cardId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cardId).toBe(testCard.cardId);
      expect(response.body.data.title).toBe(testCard.title);
    });

    it('should return 404 for non-existent cardId', async () => {
      const app = createTestApp(testUser);

      const response = await request(app)
        .get('/api/invitations/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should allow access to published cards without authentication', async () => {
      testCard.isPublished = true;
      await testCard.save();

      const app = createTestApp(null);

      const response = await request(app)
        .get(`/api/invitations/${testCard.cardId}`)
        .expect(200);

      expect(response.body.data.cardId).toBe(testCard.cardId);
    });
  });

  describe('PUT /api/invitations/:cardId', () => {
    let testCard;

    beforeEach(async () => {
      testCard = new InvitationCard({
        ...mockInvitationCard,
        creator: testUser._id
      });
      await testCard.save();
    });

    it('should update invitation when authenticated as creator', async () => {
      const app = createTestApp(testUser);

      const updates = {
        title: 'Updated Title',
        eventDetails: {
          location: 'Updated Location',
          dateTime: new Date('2026-01-01'),
          description: 'Updated description'
        }
      };

      const response = await request(app)
        .put(`/api/invitations/${testCard.cardId}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
      expect(response.body.data.eventDetails.location).toBe('Updated Location');
    });

    it('should return 401 when not authenticated', async () => {
      const app = createTestApp(null);

      await request(app)
        .put(`/api/invitations/${testCard.cardId}`)
        .send({ title: 'New Title' })
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
        .put(`/api/invitations/${testCard.cardId}`)
        .send({ title: 'New Title' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('permission');
    });
  });

  describe('DELETE /api/invitations/:cardId', () => {
    let testCard;

    beforeEach(async () => {
      testCard = new InvitationCard({
        ...mockInvitationCard,
        creator: testUser._id
      });
      await testCard.save();
    });

    it('should delete invitation when authenticated as creator', async () => {
      const app = createTestApp(testUser);

      const response = await request(app)
        .delete(`/api/invitations/${testCard.cardId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify deletion
      const deletedCard = await InvitationCard.findOne({ cardId: testCard.cardId });
      expect(deletedCard).toBeNull();
    });

    it('should return 401 when not authenticated', async () => {
      const app = createTestApp(null);

      await request(app)
        .delete(`/api/invitations/${testCard.cardId}`)
        .expect(401);
    });

    it('should return 403 when user is not the creator', async () => {
      const otherUser = new User({
        ...mockUser,
        googleId: 'other-id',
        email: 'other@example.com'
      });
      await otherUser.save();

      const app = createTestApp(otherUser);

      await request(app)
        .delete(`/api/invitations/${testCard.cardId}`)
        .expect(403);
    });
  });

  describe('PUT /api/invitations/:cardId/publish', () => {
    let testCard;

    beforeEach(async () => {
      testCard = new InvitationCard({
        ...mockInvitationCard,
        creator: testUser._id,
        isPublished: false
      });
      await testCard.save();
    });

    it('should publish invitation', async () => {
      const app = createTestApp(testUser);

      const response = await request(app)
        .put(`/api/invitations/${testCard.cardId}/publish`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isPublished).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      const app = createTestApp(null);

      await request(app)
        .put(`/api/invitations/${testCard.cardId}/publish`)
        .expect(401);
    });
  });

  describe('PUT /api/invitations/:cardId/unpublish', () => {
    let testCard;

    beforeEach(async () => {
      testCard = new InvitationCard({
        ...mockInvitationCard,
        creator: testUser._id,
        isPublished: true
      });
      await testCard.save();
    });

    it('should unpublish invitation', async () => {
      const app = createTestApp(testUser);

      const response = await request(app)
        .put(`/api/invitations/${testCard.cardId}/unpublish`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isPublished).toBe(false);
    });
  });
});
