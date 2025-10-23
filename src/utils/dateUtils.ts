/**
 * Date utility functions for portfolio analysis
 */

/**
 * Parse date from DD/MM/YYYY format to Date object
 * @param dateStr - Date string in DD/MM/YYYY format
 * @returns Date object or null if invalid
 */
 export const parsePortfolioDate = (dateStr: string): Date | null => {
    if (!dateStr || typeof dateStr !== 'string') {
      return null;
    }
  
    const dateParts = dateStr.trim().split('/');
    if (dateParts.length !== 3) {
      return null;
    }
  
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // JavaScript months are 0-based
    const year = parseInt(dateParts[2], 10);
  
    // Validate ranges
    if (isNaN(day) || isNaN(month) || isNaN(year) ||
        day < 1 || day > 31 ||
        month < 0 || month > 11 ||
        year < 1900 || year > 2100) {
      return null;
    }
  
    const date = new Date(year, month, day);
    
    // Verify the date is valid (handles edge cases like Feb 30)
    if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
      return null;
    }
  
    return date;
  };
  
  /**
   * Format Date object to YYYY-MM-DD format for API calls
   * @param date - Date object
   * @returns Formatted date string
   */
  export const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  /**
   * Check if two dates are the same day
   * @param date1 - First date
   * @param date2 - Second date
   * @returns True if same day
   */
  export const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };
  
  /**
   * Get date range from portfolio data
   * @param portfolioData - Array of portfolio data with date strings
   * @returns Object with start and end dates
   */
  export const getDateRange = (portfolioData: Array<{date: string}>): {start: Date | null, end: Date | null} => {
    let startDate: Date | null = null;
    let endDate: Date | null = null;
  
    for (const entry of portfolioData) {
      const date = parsePortfolioDate(entry.date);
      if (date) {
        if (!startDate || date < startDate) {
          startDate = date;
        }
        if (!endDate || date > endDate) {
          endDate = date;
        }
      }
    }
  
    return { start: startDate, end: endDate };
  };