const mongoose = require('mongoose');
const User = require('../../../models/User');
const { connect, closeDatabase, clearDatabase } = require('../../testDbHelper');
const { mockUser } = require('../../mockData');

describe('User Model Unit Tests', () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('Schema Validation', () => {
    it('should create a valid user with all required fields', async () => {
      const user = new User(mockUser);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.googleId).toBe(mockUser.googleId);
      expect(savedUser.email).toBe(mockUser.email);
      expect(savedUser.name).toBe(mockUser.name);
      expect(savedUser.googleTokens.accessToken).toBe(mockUser.googleTokens.accessToken);
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('should fail validation when googleId is missing', async () => {
      const invalidUser = new User({
        ...mockUser,
        googleId: undefined
      });

      await expect(invalidUser.save()).rejects.toThrow();
    });

    it('should fail validation when email is missing', async () => {
      const invalidUser = new User({
        ...mockUser,
        email: undefined
      });

      await expect(invalidUser.save()).rejects.toThrow();
    });

    it('should fail validation with invalid email format', async () => {
      const invalidUser = new User({
        ...mockUser,
        email: 'not-an-email'
      });

      await expect(invalidUser.save()).rejects.toThrow(/valid email/);
    });

    it('should fail validation when name is missing', async () => {
      const invalidUser = new User({
        ...mockUser,
        name: undefined
      });

      await expect(invalidUser.save()).rejects.toThrow();
    });

    it('should convert email to lowercase', async () => {
      const user = new User({
        ...mockUser,
        email: 'TEST@EXAMPLE.COM'
      });
      const savedUser = await user.save();

      expect(savedUser.email).toBe('test@example.com');
    });

    it('should trim whitespace from name and email', async () => {
      const user = new User({
        ...mockUser,
        name: '  Test User  ',
        email: '  test@example.com  '
      });
      const savedUser = await user.save();

      expect(savedUser.name).toBe('Test User');
      expect(savedUser.email).toBe('test@example.com');
    });

    it('should enforce unique googleId', async () => {
      const user1 = new User(mockUser);
      await user1.save();

      const user2 = new User({
        ...mockUser,
        email: 'different@example.com'
      });

      await expect(user2.save()).rejects.toThrow();
    });

    it('should enforce unique email', async () => {
      const user1 = new User(mockUser);
      await user1.save();

      const user2 = new User({
        ...mockUser,
        googleId: 'different-google-id'
      });

      await expect(user2.save()).rejects.toThrow();
    });
  });

  describe('Pre-save Middleware', () => {
    it('should update lastLogin when googleTokens are modified', async () => {
      const user = new User(mockUser);
      await user.save();

      const originalLastLogin = user.lastLogin;

      // Wait a bit to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 100));

      user.googleTokens.accessToken = 'new-access-token';
      await user.save();

      expect(user.lastLogin.getTime()).toBeGreaterThan(originalLastLogin.getTime());
    });

    it('should not update lastLogin when other fields are modified', async () => {
      const user = new User(mockUser);
      await user.save();

      const originalLastLogin = user.lastLogin;

      await new Promise(resolve => setTimeout(resolve, 100));

      user.name = 'New Name';
      await user.save();

      expect(user.lastLogin.getTime()).toBe(originalLastLogin.getTime());
    });
  });

  describe('Default Values', () => {
    it('should set default empty string for picture', async () => {
      const userWithoutPicture = new User({
        ...mockUser,
        picture: undefined
      });
      const savedUser = await userWithoutPicture.save();

      expect(savedUser.picture).toBe('');
    });

    it('should set lastLogin to current time on creation', async () => {
      const beforeCreate = Date.now();
      const user = new User(mockUser);
      const savedUser = await user.save();
      const afterCreate = Date.now();

      expect(savedUser.lastLogin.getTime()).toBeGreaterThanOrEqual(beforeCreate);
      expect(savedUser.lastLogin.getTime()).toBeLessThanOrEqual(afterCreate);
    });
  });

  describe('Timestamps', () => {
    it('should automatically add createdAt and updatedAt', async () => {
      const user = new User(mockUser);
      const savedUser = await user.save();

      expect(savedUser.createdAt).toBeInstanceOf(Date);
      expect(savedUser.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on modification', async () => {
      const user = new User(mockUser);
      await user.save();

      const originalUpdatedAt = user.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 100));

      user.name = 'Updated Name';
      await user.save();

      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
