const { MIN_MASTER_PASSWORD_LENGTH } = require('./constants');

/**
 * Validates the master password.
 * Must be at least 8 characters with uppercase, lowercase, and a number.
 */
function validateMasterPassword(password) {
  const errors = [];

  if (!password || password.length < MIN_MASTER_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_MASTER_PASSWORD_LENGTH} characters`);
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Must contain at least one number');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a URL (basic check).
 */
function validateUrl(url) {
  if (!url) return true; // URL is optional
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates entry fields.
 */
function validateEntry(siteName, username) {
  const errors = [];
  if (!siteName || siteName.trim().length === 0) {
    errors.push('Site name is required');
  }
  if (!username || username.trim().length === 0) {
    errors.push('Username is required');
  }
  return { valid: errors.length === 0, errors };
}

module.exports = { validateMasterPassword, validateUrl, validateEntry };
