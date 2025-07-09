// src/utils/uuid.js

/**
 * Polyfill for uuidv4 to ensure self-containment without external libraries.
 * Generates a random UUID.
 * @returns {string} A new UUID.
 */
export const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
