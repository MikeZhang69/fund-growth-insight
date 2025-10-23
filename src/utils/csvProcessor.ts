/**
 * CSV Processing Utilities
 * Handles reading portfolio CSV and generating enhanced CSV with market indices
 */

 import { fetchMarketIndicesData, getMarketIndicesHeaders, formatMarketIndicesAsCSV, MarketIndicesData } from './marketIndicesService';
 import { parsePortfolioDate } from './dateUtils';
 
 export interface PortfolioRow {
   date: string;
   sha: string;
   she: string;
   csi300: string;
   share: string;
   shareV: string;
   gainLoss: string;
   dailyGain: string;
   marketValue: string;
   principle: string;
 }
 
 export interface EnhancedPortfolioRow extends PortfolioRow {
   sp500: string;
   nasdaq: string;
   ftse100: string;
   hangSeng: string;
 }
 
 /**
  * Parse CSV content to extract portfolio data
  * @param csvContent - Raw CSV content as string
  * @returns Array of portfolio rows
  */
 export const parsePortfolioCSV = (csvContent: string): PortfolioRow[] => {
   const lines = csvContent.split(/\r?\n/);
   const portfolioData: PortfolioRow[] = [];
   
   // Skip the first line (header) and second line (column headers)
   for (let i = 2; i < lines.length; i++) {
     const line = lines[i].trim();
     if (!line) continue; // Skip empty lines
     
     const columns = line.split(',').map(col => col.trim());
     
     // Ensure we have enough columns
     if (columns.length >= 10) {
       const row: PortfolioRow = {
         date: columns[0],
         sha: columns[1],
         she: columns[2],
         csi300: columns[3],
         share: columns[4],
         shareV: columns[5],
         gainLoss: columns[6],
         dailyGain: columns[7],
         marketValue: columns[8],
         principle: columns[9]
       };
       
       // Only include rows with valid dates
       const parsedDate = parsePortfolioDate(row.date);
       if (parsedDate) {
         portfolioData.push(row);
       }
     }
   }
   
   return portfolioData;
 };
 
 /**
  * Generate enhanced CSV with market indices data
  * @param csvContent - Original portfolio CSV content
  * @returns Promise with enhanced CSV content
  */
 export const generateEnhancedPortfolioCSV = async (csvContent: string): Promise<string> => {
   try {
     console.log('Processing portfolio CSV...');
     
     // Parse the original CSV
     const portfolioRows = parsePortfolioCSV(csvContent);
     
     if (portfolioRows.length === 0) {
       throw new Error('No valid portfolio data found in CSV');
     }
     
     console.log(`Parsed ${portfolioRows.length} portfolio rows`);
     
     // Fetch market indices data
     const marketIndicesData = await fetchMarketIndicesData(portfolioRows);
     
     // Generate the enhanced CSV content
     let enhancedCSV = '';
     
     // Add the header row (from original CSV)
     const lines = csvContent.split(/\r?\n/);
     if (lines.length > 0) {
       enhancedCSV += lines[0] + '\n'; // First header line
     }
     
     // Add column headers with market indices
     const originalHeaders = 'Date,SHA,SHE,CSI300,Share,Share_V,Gain_Loss,DailyGain,Market_Value,Principle';
     const marketHeaders = getMarketIndicesHeaders();
     enhancedCSV += `${originalHeaders},${marketHeaders}\n`;
     
     // Add data rows with market indices
     for (const row of portfolioRows) {
       const marketData = marketIndicesData[row.date];
       const marketCSVValues = formatMarketIndicesAsCSV(marketData);
       
       const originalRowData = `${row.date},${row.sha},${row.she},${row.csi300},${row.share},${row.shareV},${row.gainLoss},${row.dailyGain},${row.marketValue},${row.principle}`;
       enhancedCSV += `${originalRowData},${marketCSVValues}\n`;
     }
     
     console.log('Enhanced CSV generated successfully');
     return enhancedCSV;
     
   } catch (error) {
     console.error('Error generating enhanced portfolio CSV:', error);
     throw error;
   }
 };
 
 /**
  * Download CSV file to user's computer
  * @param csvContent - CSV content as string
  * @param filename - Name for the downloaded file
  */
 export const downloadCSV = (csvContent: string, filename: string = 'portfolio_indices_snapshot.csv') => {
   try {
     // Create blob with CSV content
     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
     
     // Create download link
     const link = document.createElement('a');
     const url = URL.createObjectURL(blob);
     link.setAttribute('href', url);
     link.setAttribute('download', filename);
     link.style.visibility = 'hidden';
     
     // Trigger download
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
     
     console.log(`CSV file ${filename} downloaded successfully`);
   } catch (error) {
     console.error('Error downloading CSV file:', error);
     throw error;
   }
 };
 
 /**
  * Process portfolio file and generate enhanced CSV with market indices
  * @param file - Portfolio CSV file from user upload
  * @returns Promise with enhanced CSV content
  */
 export const processPortfolioFile = async (file: File): Promise<string> => {
   return new Promise((resolve, reject) => {
     const reader = new FileReader();
     
     reader.onload = async (e) => {
       try {
         const csvContent = e.target?.result as string;
         const enhancedCSV = await generateEnhancedPortfolioCSV(csvContent);
         resolve(enhancedCSV);
       } catch (error) {
         reject(error);
       }
     };
     
     reader.onerror = () => {
       reject(new Error('Failed to read file'));
     };
     
     reader.readAsText(file);
   });
 };
 
 /**
  * Generate enhanced CSV from the default portfolio snapshot
  * @returns Promise with enhanced CSV content
  */
 export const processDefaultPortfolioSnapshot = async (): Promise<string> => {
   try {
     const response = await fetch('/PORTFOLIO_SNAPSHOT.csv');
     if (!response.ok) {
       throw new Error(`Failed to fetch portfolio snapshot: ${response.statusText}`);
     }
     
     const csvContent = await response.text();
     return await generateEnhancedPortfolioCSV(csvContent);
   } catch (error) {
     console.error('Error processing default portfolio snapshot:', error);
     throw error;
   }
 };