// Emojicoding utility for BDO
// Generates unique 8-emoji codes: 3 base emoji + 5 unique emoji

// Diverse emoji palette for unique codes (avoiding similar-looking emojis)
const EMOJI_PALETTE = [
  '🌟', '🌙', '🌍', '🌊', '🔥', '💎', '🎨', '🎭', '🎪', '🎯',
  '🎲', '🎸', '🎹', '🎺', '🎻', '🏆', '🏹', '🏺', '🏰', '🏔',
  '🐉', '🐙', '🐚', '🐝', '🐞', '🐢', '🐳', '🐺', '🐻', '🐼',
  '👑', '👒', '👓', '👔', '👕', '💀', '💡', '💣', '💫', '💰',
  '💼', '📌', '📍', '📎', '📐', '📑', '📕', '📗', '📘', '📙',
  '📚', '📝', '📡', '📢', '📣', '📦', '📧', '📨', '📬', '📮',
  '🔑', '🔒', '🔓', '🔔', '🔨', '🔩', '🔪', '🔫', '🔮', '🔱',
  '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙',
  '🗝', '🗡', '🗿', '😀', '😁', '😂', '😃', '😄', '😅', '😆',
  '🙂', '🙃', '🙄', '🚀', '🚁', '🚂', '🚃', '🚄', '🚅', '🚆'
];

/**
 * Generates a random 5-emoji unique code from the palette
 * @returns {string} 5-emoji string
 */
function generateUniqueEmojis() {
  const shuffled = [...EMOJI_PALETTE].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5).join('');
}

/**
 * Generates a full emojicode: 3 base emoji + 5 unique emoji
 * @param {string} baseEmoji - 3-emoji base string (from env var)
 * @param {Function} checkCollision - Async function to check if code exists
 * @param {number} maxAttempts - Maximum collision retry attempts (default 100)
 * @returns {Promise<string>} 8-emoji emojicode
 */
async function generateEmojicode(baseEmoji, checkCollision, maxAttempts = 100) {
  if (!baseEmoji || baseEmoji.length < 3) {
    throw new Error('Base emoji must be at least 3 characters');
  }

  // Extract first 3 emoji from base
  const base = [...baseEmoji].slice(0, 3).join('');

  let attempts = 0;
  while (attempts < maxAttempts) {
    const uniqueEmojis = generateUniqueEmojis();
    const fullCode = `${base}${uniqueEmojis}`;

    // Check for collision
    const exists = await checkCollision(fullCode);
    if (!exists) {
      return fullCode;
    }

    attempts++;
  }

  throw new Error(`Failed to generate unique emojicode after ${maxAttempts} attempts`);
}

/**
 * Validates an emojicode format
 * @param {string} emojicode - The emojicode to validate
 * @returns {boolean} True if valid format
 */
function isValidEmojicode(emojicode) {
  if (!emojicode) return false;

  // Convert to array of emoji characters (handles multi-byte UTF-8)
  const emojiArray = [...emojicode];

  // Must be exactly 8 emoji
  return emojiArray.length === 8;
}

/**
 * Extracts the base emoji from a full emojicode
 * @param {string} emojicode - The full 8-emoji code
 * @returns {string} First 3 emoji (base)
 */
function getBaseFromEmojicode(emojicode) {
  return [...emojicode].slice(0, 3).join('');
}

/**
 * Extracts the unique emoji from a full emojicode
 * @param {string} emojicode - The full 8-emoji code
 * @returns {string} Last 5 emoji (unique)
 */
function getUniqueFromEmojicode(emojicode) {
  return [...emojicode].slice(3, 8).join('');
}

module.exports = {
  generateEmojicode,
  isValidEmojicode,
  getBaseFromEmojicode,
  getUniqueFromEmojicode,
  EMOJI_PALETTE
};
