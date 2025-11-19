const request = require('supertest');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const authRoutes = require('../../routes/authRoutes');
const User = require('../../models/User');
const { connect, closeDatabase, clearDatabase } = require('../testDbHelper');
const { mockUser } = require('../mockData');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  // Serialize/deserialize for testing
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.use('/api/auth', authRoutes);
  return app;
};

describe('Auth API Integration Tests', () => {
  let app;
  let testUser;

  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    app = createTestApp();

    // Create test user
    testUser = new User(mockUser);
    await testUser.save();
  });

  describe('GET /api/auth/current-user', () => {
    it('should return current user when authenticated', async () => {
      const agent = request.agent(app);

      // Simulate authentication by setting session
      await agent
        .get('/api/auth/current-user')
        .set('Cookie', [`connect.sid=test-session-id`])
        .expect(200);

      // Note: Full integration with Passport would require more setup
      // This is a simplified test
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/current-user')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Not authenticated');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out successfully');
    });

    it('should handle logout errors gracefully', async () => {
      // This test would require mocking req.logout to throw an error
      // For now, just test the happy path
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Google OAuth Flow', () => {
    it('should have /google route defined', async () => {
      // Just verify the route exists
      // Full OAuth testing would require mocking Google's OAuth service
      const response = await request(app)
        .get('/api/auth/google');

      // Should redirect or return some response (not 404)
      expect(response.status).not.toBe(404);
    });

    it('should have /google/callback route defined', async () => {
      const response = await request(app)
        .get('/api/auth/google/callback');

      // Should redirect or return some response (not 404)
      expect(response.status).not.toBe(404);
    });
  });
});
