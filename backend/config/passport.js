const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const logger = require('./logger');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    logger.error('Error deserializing user:', error);
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
      scope: [
        'profile',
        'email',
        'https://www.googleapis.com/auth/spreadsheets', // Access to Google Sheets
        'https://www.googleapis.com/auth/drive.readonly' // Access to list user's Drive files
      ],
      accessType: 'offline', // Get refresh token
      prompt: 'consent' // Force consent screen to get refresh token every time
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        logger.info(`Google OAuth callback for user: ${profile.id}`);

        // Check if user exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Update tokens
          user.googleTokens = {
            accessToken,
            refreshToken: refreshToken || user.googleTokens.refreshToken, // Keep old refresh token if new one not provided
            expiryDate: Date.now() + 3600 * 1000 // 1 hour from now
          };
          user.lastLogin = Date.now();
          user.picture = profile.photos?.[0]?.value || user.picture;
          await user.save();
          logger.info(`Updated existing user: ${user.email}`);
        } else {
          // Create new user
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            picture: profile.photos?.[0]?.value || '',
            googleTokens: {
              accessToken,
              refreshToken,
              expiryDate: Date.now() + 3600 * 1000
            }
          });
          logger.info(`Created new user: ${user.email}`);
        }

        return done(null, user);
      } catch (error) {
        logger.error('Error in Google OAuth strategy:', error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
