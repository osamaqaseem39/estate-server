const jwt = require('jsonwebtoken');

function getToken(req) {
  const header = req.header('Authorization');
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }
  return req.header('x-auth-token');
}

module.exports = (req, res, next) => {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
