// src/utils/objectUtils.js

/**
 * Sets a value in a nested object based on a dot-notation key.
 * @param {object} obj - The object to modify.
 * @param {string} path - The dot-notation path (e.g., 'user.address.city').
 * @param {*} value - The value to set.
 * @returns {object} The modified object.
 */
export const setNestedValue = (obj, path, value) => {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
            current[keys[i]] = {};
        }
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    return obj;
};

/**
 * Gets a value from a nested object based on a dot-notation key.
 * @param {object} obj - The object to read from.
 * @param {string} path - The dot-notation path.
 * @returns {*} The value found at the path, or undefined.
 */
export const getNestedValue = (obj, path) => {
    if (!path) return undefined;
    return path.split('.').reduce((acc, key) => acc && acc[key], obj);
};
