// src/services/dateUtils.js

/**
 * Checks if a given date is a holiday.
 * @param {Date} date - The date to check.
 * @param {Array<string>} holidays - An array of holiday strings in 'YYYY-MM-DD' format.
 * @returns {boolean} True if the date is a holiday.
 */
export const isHoliday = (date, holidays) => {
    const dateString = date.toISOString().split('T')[0];
    return holidays.includes(dateString);
};

/**
 * Calculates an end date based on a start date, duration, and type of days.
 * @param {Date} startDate - The starting date.
 * @param {number} duration - The number of days to add.
 * @param {string} dayType - 'corridos', 'habiles-administrativos', etc.
 * @param {Array<string>} holidays - An array of holiday strings.
 * @returns {Date} The calculated end date.
 */
export const calculateEndDate = (startDate, duration, dayType, holidays) => {
    if (isNaN(duration) || duration <= 0 || dayType === 'sin-plazo') return new Date(startDate);
    
    let currentDate = new Date(startDate);
    let daysAdded = 0;
    
    while (daysAdded < duration) {
        currentDate.setDate(currentDate.getDate() + 1);
        if (dayType === 'habiles-administrativos' || dayType === 'habiles-judiciales') {
             const dayOfWeek = currentDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday(currentDate, holidays)) {
                daysAdded++;
            }
        } else { // 'corridos'
            daysAdded++;
        }
    }
    return currentDate;
};
