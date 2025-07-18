// src/utils/userUtils.js

/**
 * Finds a user's name by their ID from a list of all users.
 * @param {string} userId - The ID of the user to find.
 * @param {Array} allUsers - The array of all user objects.
 * @returns {string} The user's full name or "N/A" if not found.
 */
export const getUserNameById = (userId, allUsers) => {
    if (!userId || !allUsers) return "N/A";
    const user = allUsers.find(u => u.uid === userId);
    // --- LÓGICA ACTUALIZADA ---
    if (user) {
        return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return "N/A";
};

/**
 * Checks if a user has at least one of the required permissions.
 * @param {object} user - The user object with a `permissions` property.
 * @param {string|Array<string>} requiredPermissions - A single permission or an array of permissions.
 * @returns {boolean} True if the user has the permission.
 */
export const userHasPermission = (user, requiredPermissions) => {
    if (!user || !user.permissions) return false;
    const permissionsToCheck = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    return permissionsToCheck.some(p => user.permissions[p]);
};
