/**
 * Market Indices Service
 * Provides functionality to fetch historical market index data
 */

 import { formatDateForAPI, parsePortfolioDate } from './dateUtils';

 export interface MarketIndicesData {
   date: string;
   sp500?: number;
   nasdaq?: number;
   ftse100?: number;
   hangSeng?: number;
 }
 
 export interface IndexSymbol {
   symbol: string;
   name: string;
   key: keyof MarketIndicesData;
 }
 
 // Yahoo Finance symbols mapping for major indices
 export const INDEX_SYMBOLS: IndexSymbol[] = [
   { symbol: '^GSPC', name: 'S&P 500', key: 'sp500' },
   { symbol: '^IXIC', name: 'Nasdaq Composite', key: 'nasdaq' },
   { symbol: '^FTSE', name: 'FTSE 100', key: 'ftse100' },
   { symbol: '^HSI', name: 'Hang Seng Index', key: 'hangSeng' }
 ];
 
 // Yahoo Finance API configuration
 const YAHOO_FINANCE_URLS = [
   'https://query1.finance.yahoo.com/v8/finance/chart',
   'https://query2.finance.yahoo.com/v8/finance/chart',
   'https://finance.yahoo.com/quote'
 ];
 
 // Multiple CORS proxy options for better reliability
 const PROXY_URLS = [
   'https://api.allorigins.win/raw?url=',
   'https://corsproxy.io/?',
   'https://cors-anywhere.herokuapp.com/',
 ];
 
 let currentProxyIndex = 0;
 
 /**
  * Fetch historical data for a single index using Yahoo Finance API with retry logic
  * @param symbol - Yahoo Finance symbol for the index (e.g., ^GSPC for S&P 500)
  * @param fromDate - Start date for data
  * @param toDate - End date for data
  * @param retryCount - Number of retry attempts (internal use)
  * @returns Promise with historical data
  */
 const fetchIndexData = async (symbol: string, fromDate: Date, toDate: Date, retryCount: number = 0): Promise<Record<string, number>> => {
   try {
     console.log(`Fetching data for ${symbol} from ${formatDateForAPI(fromDate)} to ${formatDateForAPI(toDate)} (attempt ${retryCount + 1})`);
     
     // Convert dates to Unix timestamps for Yahoo Finance API
     const period1 = Math.floor(fromDate.getTime() / 1000);
     const period2 = Math.floor(toDate.getTime() / 1000);
     
     // Build Yahoo Finance API URL - use first URL as primary
     const yahooUrl = `${YAHOO_FINANCE_URLS[0]}/${encodeURIComponent(symbol)}?period1=${period1}&period2=${period2}&interval=1d&includePrePost=true&events=div%2Csplit`;
     
     // Try different CORS proxies
     const proxyUrl = `${PROXY_URLS[retryCount % PROXY_URLS.length]}${encodeURIComponent(yahooUrl)}`;
     
     console.log(`Fetching from: ${yahooUrl} via proxy: ${PROXY_URLS[retryCount % PROXY_URLS.length]}`);
     
     const response = await fetch(proxyUrl, {
       method: 'GET',
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
       },
       // Add timeout (more compatible approach)
       signal: new AbortController().signal
     });
     
     if (!response.ok) {
       throw new Error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
     }
     
     const data = await response.json();
     
     // Parse Yahoo Finance response structure
     if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
       console.warn(`No data found for symbol ${symbol}`);
       return {};
     }
     
     const result = data.chart.result[0];
     const timestamps = result.timestamp;
     const closes = result.indicators?.quote?.[0]?.close;
     
     if (!timestamps || !closes) {
       console.warn(`Invalid data structure for symbol ${symbol}`);
       return {};
     }
     
     const historicalData: Record<string, number> = {};
     
     // Process the data and convert timestamps to dates
     for (let i = 0; i < timestamps.length; i++) {
       const timestamp = timestamps[i];
       const closePrice = closes[i];
       
       if (closePrice !== null && closePrice !== undefined && !isNaN(closePrice)) {
         const date = new Date(timestamp * 1000);
         const dateKey = formatDateForAPI(date);
         historicalData[dateKey] = parseFloat(closePrice.toFixed(2));
       }
     }
     
     console.log(`✓ Successfully fetched ${Object.keys(historicalData).length} data points for ${symbol}`);
     return historicalData;
     
   } catch (error) {
     console.error(`Error fetching data for ${symbol} (attempt ${retryCount + 1}):`, error);
     
     // Retry with different proxy if we haven't exhausted all options
     if (retryCount < PROXY_URLS.length - 1) {
       console.log(`Retrying ${symbol} with different proxy...`);
       await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
       return fetchIndexData(symbol, fromDate, toDate, retryCount + 1);
     }
     
     // All proxies failed, return empty data rather than failing completely
     console.warn(`All proxies failed for ${symbol}, returning empty dataset`);
     return {};
   }
 };
 
 /**
  * Get market indices data for the date range in portfolio
  * @param portfolioData - Array of portfolio data with dates
  * @returns Promise with combined market indices data
  */
 export const fetchMarketIndicesData = async (
   portfolioData: Array<{ date: string }>
 ): Promise<Record<string, MarketIndicesData>> => {
   try {
     console.log('Fetching market indices data...');
     
     // Extract unique dates from portfolio data
     const uniqueDates = [...new Set(portfolioData.map(item => item.date))];
     const validDates = uniqueDates
       .map(dateStr => ({ dateStr, dateObj: parsePortfolioDate(dateStr) }))
       .filter(item => item.dateObj !== null)
       .sort((a, b) => (a.dateObj as Date).getTime() - (b.dateObj as Date).getTime());
     
     if (validDates.length === 0) {
       throw new Error('No valid dates found in portfolio data');
     }
     
     const fromDate = validDates[0].dateObj as Date;
     const toDate = validDates[validDates.length - 1].dateObj as Date;
     
     console.log(`Date range: ${formatDateForAPI(fromDate)} to ${formatDateForAPI(toDate)}`);
     
     // Fetch data for all indices with individual error handling
     // Process sequentially to avoid overwhelming the proxy servers
     const indexResults: Array<{ index: IndexSymbol; data: Record<string, number>; success: boolean }> = [];
     
     for (const index of INDEX_SYMBOLS) {
       try {
         console.log(`🔄 Starting fetch for ${index.name} (${index.symbol})`);
         const data = await fetchIndexData(index.symbol, fromDate, toDate);
         console.log(`✅ Completed fetch for ${index.name}: ${Object.keys(data).length} data points`);
         indexResults.push({ index, data, success: true });
         
         // Add a small delay between requests to avoid rate limiting
         await new Promise(resolve => setTimeout(resolve, 500));
       } catch (error) {
         console.error(`❌ Failed to fetch data for ${index.name} (${index.symbol}):`, error);
         indexResults.push({ index, data: {}, success: false });
       }
     }
     
     // Log summary of fetch results
     indexResults.forEach(({ index, data, success }) => {
       if (success) {
         console.log(`✓ ${index.name}: ${Object.keys(data).length} data points fetched`);
       } else {
         console.log(`✗ ${index.name}: Failed to fetch data`);
       }
     });
     
     // Combine all index data by date
     const combinedData: Record<string, MarketIndicesData> = {};
     
     // Initialize with portfolio dates
     for (const { dateStr, dateObj } of validDates) {
       const apiDate = formatDateForAPI(dateObj as Date);
       combinedData[dateStr] = { date: dateStr };
       
       // Add index data for this date
       indexResults.forEach(({ index, data }) => {
         let value = data[apiDate];
         
         // If exact date not found, try to find the closest previous trading day
         if (value === undefined) {
           const currentDate = dateObj as Date;
           const searchDate = new Date(currentDate);
           
           // Look back up to 7 days for the closest trading day
           for (let i = 1; i <= 7; i++) {
             searchDate.setDate(currentDate.getDate() - i);
             const searchKey = formatDateForAPI(searchDate);
             if (data[searchKey] !== undefined) {
               value = data[searchKey];
               console.log(`Using ${searchKey} data for ${apiDate} (${index.symbol})`);
               break;
             }
           }
         }
         
         if (value !== undefined) {
           (combinedData[dateStr] as any)[index.key] = value;
         } else {
           console.warn(`No market data found for ${index.symbol} on ${dateStr}`);
         }
       });
     }
     
     console.log(`Market indices data fetched for ${Object.keys(combinedData).length} dates`);
     return combinedData;
     
   } catch (error) {
     console.error('Error in fetchMarketIndicesData:', error);
     throw error;
   }
 };
 
 /**
  * Format market indices data as CSV headers
  * @returns CSV headers string
  */
 export const getMarketIndicesHeaders = (): string => {
   return 'SP500,Nasdaq,FTSE100,HangSeng';
 };
 
 /**
  * Format market indices values as CSV row
  * @param indicesData - Market indices data for a specific date
  * @returns CSV values string
  */
 export const formatMarketIndicesAsCSV = (indicesData?: MarketIndicesData): string => {
   if (!indicesData) {
     return ',,,,'; // Empty values
   }
   
   const sp500 = indicesData.sp500 ? indicesData.sp500.toFixed(2) : '';
   const nasdaq = indicesData.nasdaq ? indicesData.nasdaq.toFixed(2) : '';
   const ftse100 = indicesData.ftse100 ? indicesData.ftse100.toFixed(2) : '';
   const hangSeng = indicesData.hangSeng ? indicesData.hangSeng.toFixed(2) : '';
   
   return `${sp500},${nasdaq},${ftse100},${hangSeng}`;
 };