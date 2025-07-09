// src/utils/userUtils.js

/**
 * Finds a user's name by their ID from a list of all users.
 * @param {string} userId - The ID of the user to find.
 * @param {Array} allUsers - The array of all user objects.
 * @returns {string} The user's name or "N/A" if not found.
 */
export const getUserNameById = (userId, allUsers) => {
    if (!userId || !allUsers) return "N/A";
    const user = allUsers.find(u => u.uid === userId);
    return user?.name || "N/A";
};
