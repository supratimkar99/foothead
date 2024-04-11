const jwt = require('jsonwebtoken');

// Middleware function to verify JWT token
const tokenValidator = (req, res, next) => {
  // Get the token from the request headers
  const token = req.header('Authorization') && req.header('Authorization').replace('Bearer ','');

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    next(); // Call next middleware or controller method
  });
};

module.exports = tokenValidator;
