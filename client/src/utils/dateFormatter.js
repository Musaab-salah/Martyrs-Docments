/**
 * Utility functions for formatting dates in Gregorian format
 */

/**
 * Formats a date string or Date object to DD/MM/YYYY format
 * @param {string|Date} date - The date to format (ISO string or Date object)
 * @returns {string} Formatted date in DD/MM/YYYY format
 */
export const formatDateToGregorian = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Formats a date string or Date object to YYYY-MM-DD format
 * @param {string|Date} date - The date to format (ISO string or Date object)
 * @returns {string} Formatted date in YYYY-MM-DD format
 */
export const formatDateToISO = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Formats a date string or Date object to a readable format (e.g., "29 August 2025")
 * @param {string|Date} date - The date to format (ISO string or Date object)
 * @param {string} locale - The locale to use (default: 'en-GB')
 * @returns {string} Formatted date in readable format
 */
export const formatDateToReadable = (date, locale = 'en-GB') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};
