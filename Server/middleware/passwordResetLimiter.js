// In-memory store for tracking reset attempts per user
const resetAttempts = new Map();

const PASSWORD_RESET_LIMIT = 5; // Max attempts per hour
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

export const passwordResetRateLimit = async (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return next(); // Let validation middleware handle this
  }

  // Normalize email for consistent tracking
  const normalizedEmail = email.trim().toLowerCase();

  const now = Date.now();
  const userAttempts = resetAttempts.get(normalizedEmail) || { count: 0, resetTime: now + WINDOW_MS };

  // Clean up expired entries
  if (now > userAttempts.resetTime) {
    resetAttempts.delete(normalizedEmail);
    userAttempts.count = 0;
    userAttempts.resetTime = now + WINDOW_MS;
  }

  if (userAttempts.count >= PASSWORD_RESET_LIMIT) {
    return res.status(429).json({
      message: 'Too many password reset attempts. Please try again in an hour.',
      retryAfter: Math.ceil((userAttempts.resetTime - now) / 1000)
    });
  }

  userAttempts.count++;
  resetAttempts.set(normalizedEmail, userAttempts);
  
  next();
};

// Clean up expired entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [email, attempts] of resetAttempts.entries()) {
    if (now > attempts.resetTime) {
      resetAttempts.delete(email);
    }
  }
}, WINDOW_MS);
