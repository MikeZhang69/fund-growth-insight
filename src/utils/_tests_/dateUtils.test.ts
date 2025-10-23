/**
 * Tests for date utility functions
 */

 import { parsePortfolioDate, formatDateForAPI, isSameDay, getDateRange } from '../dateUtils';

 describe('dateUtils', () => {
   describe('parsePortfolioDate', () => {
     it('should parse valid DD/MM/YYYY format correctly', () => {
       const result = parsePortfolioDate('20/01/2014');
       expect(result).toBeInstanceOf(Date);
       expect(result?.getDate()).toBe(20);
       expect(result?.getMonth()).toBe(0); // January is 0
       expect(result?.getFullYear()).toBe(2014);
     });
 
     it('should return null for invalid date format', () => {
       expect(parsePortfolioDate('invalid')).toBeNull();
       expect(parsePortfolioDate('2014/01/20')).toBeNull();
       expect(parsePortfolioDate('')).toBeNull();
       expect(parsePortfolioDate('32/01/2014')).toBeNull(); // Invalid day
     });
 
     it('should handle edge cases', () => {
       expect(parsePortfolioDate('29/02/2020')).toBeInstanceOf(Date); // Leap year
       expect(parsePortfolioDate('29/02/2019')).toBeNull(); // Non-leap year
     });
   });
 
   describe('formatDateForAPI', () => {
     it('should format date to YYYY-MM-DD', () => {
       const date = new Date(2014, 0, 20); // January 20, 2014
       expect(formatDateForAPI(date)).toBe('2014-01-20');
     });
 
     it('should pad single digits with zeros', () => {
       const date = new Date(2014, 0, 1); // January 1, 2014
       expect(formatDateForAPI(date)).toBe('2014-01-01');
     });
   });
 
   describe('isSameDay', () => {
     it('should return true for same dates', () => {
       const date1 = new Date(2014, 0, 20);
       const date2 = new Date(2014, 0, 20);
       expect(isSameDay(date1, date2)).toBe(true);
     });
 
     it('should return false for different dates', () => {
       const date1 = new Date(2014, 0, 20);
       const date2 = new Date(2014, 0, 21);
       expect(isSameDay(date1, date2)).toBe(false);
     });
   });
 
   describe('getDateRange', () => {
     it('should find min and max dates from portfolio data', () => {
       const portfolioData = [
         { date: '20/01/2014' },
         { date: '22/01/2014' },
         { date: '21/01/2014' }
       ];
       
       const { start, end } = getDateRange(portfolioData);
       expect(start).toBeInstanceOf(Date);
       expect(end).toBeInstanceOf(Date);
       expect(start?.getTime()).toBeLessThan(end?.getTime() as number);
     });
 
     it('should handle empty or invalid data', () => {
       const { start, end } = getDateRange([]);
       expect(start).toBeNull();
       expect(end).toBeNull();
       
       const { start: start2, end: end2 } = getDateRange([{ date: 'invalid' }]);
       expect(start2).toBeNull();
       expect(end2).toBeNull();
     });
   });
 });