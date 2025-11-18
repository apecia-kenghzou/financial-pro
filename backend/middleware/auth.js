const { UnauthorizedError } = require('../utils/errors');

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Authentication required. Please log in with Google.'
  });
};

// Check if user owns the resource
const isOwner = (resourceUserIdField = 'creator') => {
  return async (req, res, next) => {
    try {
      // The resource should be loaded by the controller
      // and attached to req.resource
      if (!req.resource) {
        return res.status(500).json({
          success: false,
          message: 'Resource not found for ownership check'
        });
      }

      const resourceOwnerId = req.resource[resourceUserIdField]?.toString();
      const currentUserId = req.user._id.toString();

      if (resourceOwnerId !== currentUserId) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this resource'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  isAuthenticated,
  isOwner
};
