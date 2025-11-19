const mongoose = require('mongoose');
const InvitationCard = require('../../../models/InvitationCard');
const User = require('../../../models/User');
const { connect, closeDatabase, clearDatabase } = require('../../testDbHelper');
const { mockUser, mockInvitationCard } = require('../../mockData');

describe('InvitationCard Model Unit Tests', () => {
  let testUser;

  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    // Create a test user for the invitation cards
    testUser = new User(mockUser);
    await testUser.save();
  });

  describe('Schema Validation', () => {
    it('should create a valid invitation card with all required fields', async () => {
      const card = new InvitationCard({
        ...mockInvitationCard,
        creator: testUser._id
      });
      const savedCard = await card.save();

      expect(savedCard._id).toBeDefined();
      expect(savedCard.cardId).toBe(mockInvitationCard.cardId);
      expect(savedCard.title).toBe(mockInvitationCard.title);
      expect(savedCard.creator.toString()).toBe(testUser._id.toString());
      expect(savedCard.isPublished).toBe(true);
      expect(savedCard.createdAt).toBeDefined();
    });

    it('should fail validation when cardId is missing', async () => {
      const invalidCard = new InvitationCard({
        ...mockInvitationCard,
        cardId: undefined,
        creator: testUser._id
      });

      await expect(invalidCard.save()).rejects.toThrow();
    });

    it('should fail validation when cardId is not exactly 10 characters', async () => {
      const invalidCard = new InvitationCard({
        ...mockInvitationCard,
        cardId: '123',
        creator: testUser._id
      });

      await expect(invalidCard.save()).rejects.toThrow(/exactly 10 characters/);
    });

    it('should fail validation when creator is missing', async () => {
      const invalidCard = new InvitationCard({
        ...mockInvitationCard,
        creator: undefined
      });

      await expect(invalidCard.save()).rejects.toThrow();
    });

    it('should fail validation when title is missing', async () => {
      const invalidCard = new InvitationCard({
        ...mockInvitationCard,
        title: undefined,
        creator: testUser._id
      });

      await expect(invalidCard.save()).rejects.toThrow();
    });

    it('should fail validation when title exceeds 200 characters', async () => {
      const invalidCard = new InvitationCard({
        ...mockInvitationCard,
        title: 'a'.repeat(201),
        creator: testUser._id
      });

      await expect(invalidCard.save()).rejects.toThrow(/less than 200 characters/);
    });

    it('should fail validation when canvasData is missing', async () => {
      const invalidCard = new InvitationCard({
        ...mockInvitationCard,
        canvasData: undefined,
        creator: testUser._id
      });

      await expect(invalidCard.save()).rejects.toThrow();
    });

    it('should fail validation when canvasData is not an object', async () => {
      const invalidCard = new InvitationCard({
        ...mockInvitationCard,
        canvasData: 'not an object',
        creator: testUser._id
      });

      await expect(invalidCard.save()).rejects.toThrow(/valid object/);
    });

    it('should fail validation when canvasData is an array', async () => {
      const invalidCard = new InvitationCard({
        ...mockInvitationCard,
        canvasData: [],
        creator: testUser._id
      });

      await expect(invalidCard.save()).rejects.toThrow(/valid object/);
    });

    it('should fail validation when event location is missing', async () => {
      const invalidCard = new InvitationCard({
        ...mockInvitationCard,
        creator: testUser._id,
        eventDetails: {
          ...mockInvitationCard.eventDetails,
          location: undefined
        }
      });

      await expect(invalidCard.save()).rejects.toThrow();
    });

    it('should fail validation when event dateTime is missing', async () => {
      const invalidCard = new InvitationCard({
        ...mockInvitationCard,
        creator: testUser._id,
        eventDetails: {
          ...mockInvitationCard.eventDetails,
          dateTime: undefined
        }
      });

      await expect(invalidCard.save()).rejects.toThrow();
    });

    it('should fail validation when location exceeds 500 characters', async () => {
      const invalidCard = new InvitationCard({
        ...mockInvitationCard,
        creator: testUser._id,
        eventDetails: {
          ...mockInvitationCard.eventDetails,
          location: 'a'.repeat(501)
        }
      });

      await expect(invalidCard.save()).rejects.toThrow(/less than 500 characters/);
    });

    it('should fail validation when description exceeds 2000 characters', async () => {
      const invalidCard = new InvitationCard({
        ...mockInvitationCard,
        creator: testUser._id,
        eventDetails: {
          ...mockInvitationCard.eventDetails,
          description: 'a'.repeat(2001)
        }
      });

      await expect(invalidCard.save()).rejects.toThrow(/less than 2000 characters/);
    });

    it('should trim whitespace from text fields', async () => {
      const card = new InvitationCard({
        ...mockInvitationCard,
        title: '  Test Title  ',
        creator: testUser._id,
        eventDetails: {
          location: '  Test Location  ',
          dateTime: mockInvitationCard.eventDetails.dateTime,
          description: '  Test Description  '
        }
      });
      const savedCard = await card.save();

      expect(savedCard.title).toBe('Test Title');
      expect(savedCard.eventDetails.location).toBe('Test Location');
      expect(savedCard.eventDetails.description).toBe('Test Description');
    });

    it('should enforce unique cardId', async () => {
      const card1 = new InvitationCard({
        ...mockInvitationCard,
        creator: testUser._id
      });
      await card1.save();

      const card2 = new InvitationCard({
        ...mockInvitationCard,
        creator: testUser._id
      });

      await expect(card2.save()).rejects.toThrow();
    });
  });

  describe('Default Values', () => {
    it('should set isPublished to false by default', async () => {
      const card = new InvitationCard({
        ...mockInvitationCard,
        isPublished: undefined,
        creator: testUser._id
      });
      const savedCard = await card.save();

      expect(savedCard.isPublished).toBe(false);
    });

    it('should set googleSheetId to empty string by default', async () => {
      const card = new InvitationCard({
        ...mockInvitationCard,
        googleSheetId: undefined,
        creator: testUser._id
      });
      const savedCard = await card.save();

      expect(savedCard.googleSheetId).toBe('');
    });

    it('should set description to empty string by default', async () => {
      const card = new InvitationCard({
        ...mockInvitationCard,
        creator: testUser._id,
        eventDetails: {
          location: mockInvitationCard.eventDetails.location,
          dateTime: mockInvitationCard.eventDetails.dateTime,
          description: undefined
        }
      });
      const savedCard = await card.save();

      expect(savedCard.eventDetails.description).toBe('');
    });
  });

  describe('Timestamps', () => {
    it('should automatically add createdAt and updatedAt', async () => {
      const card = new InvitationCard({
        ...mockInvitationCard,
        creator: testUser._id
      });
      const savedCard = await card.save();

      expect(savedCard.createdAt).toBeInstanceOf(Date);
      expect(savedCard.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on modification', async () => {
      const card = new InvitationCard({
        ...mockInvitationCard,
        creator: testUser._id
      });
      await card.save();

      const originalUpdatedAt = card.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 100));

      card.title = 'Updated Title';
      await card.save();

      expect(card.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Population', () => {
    it('should populate creator field', async () => {
      const card = new InvitationCard({
        ...mockInvitationCard,
        creator: testUser._id
      });
      await card.save();

      const populatedCard = await InvitationCard.findById(card._id).populate('creator');

      expect(populatedCard.creator.email).toBe(testUser.email);
      expect(populatedCard.creator.name).toBe(testUser.name);
    });
  });
});
