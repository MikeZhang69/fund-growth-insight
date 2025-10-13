export interface PortfolioData {
  date: string;
  shareValue: number;
  sha: number;
  she: number;
  csi300: number;
  shares: number;
  gainLoss: number;
  dailyGain: number;
  marketValue: number;
  principle: number;
}

export interface AnnualReturn {
  year: number;
  fundReturn: number;
  shaReturn: number;
  sheReturn: number;
  csi300Return: number;
}

export interface CorrelationData {
  sha: number;
  she: number;
  csi300: number;
}

export interface RiskMetrics {
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  downsideDeviation: number;
  sortinioRatio: number;
}

export interface BenchmarkComparison {
  benchmark: string;
  portfolioReturn: number;
  benchmarkReturn: number;
  alpha: number;
  beta: number;
  trackingError: number;
  informationRatio: number;
  activeReturn: number;
}

export interface DrawdownPeriod {
  startDate: string;
  endDate: string;
  recoveryDate?: string;
  peakValue: number;
  troughValue: number;
  drawdownPercent: number;
  durationDays: number;
  recoveryDays?: number;
}

export interface DrawdownAnalysis {
  maxDrawdown: DrawdownPeriod;
  allDrawdowns: DrawdownPeriod[];
  averageDrawdown: number;
  averageRecoveryTime: number;
  currentDrawdown?: DrawdownPeriod;
}

export interface ParseResult {
  data: PortfolioData[];
  errors: string[];
  warnings: string[];
}

export function parseCSV(csvText: string): PortfolioData[] {
  const result = parseCSVWithValidation(csvText);
  if (result.errors.length > 0) {
    throw new Error(`CSV parsing errors: ${result.errors.join(', ')}`);
  }
  return result.data;
}

export function parseCSVWithValidation(csvText: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!csvText || csvText.trim().length === 0) {
    errors.push('CSV file is empty');
    return { data: [], errors, warnings };
  }

  const lines = csvText.trim().split('\n');
  
  if (lines.length < 3) {
    errors.push('CSV file must have at least 3 rows (header + 2 data rows)');
    return { data: [], errors, warnings };
  }

  const data: PortfolioData[] = [];
  const processedRows = lines.slice(2); // Skip first 2 rows (Sheet name and header)

  processedRows.forEach((line, index) => {
    const lineNumber = index + 3; // Adjust for skipped rows
    
    if (!line.trim()) {
      warnings.push(`Row ${lineNumber}: Empty row skipped`);
      return;
    }

    const values = line.split(',').map(v => v.trim());

    if (values.every(value => value === '')) {
      warnings.push(`Row ${lineNumber}: Empty row skipped`);
      return;
    }

    if (values.length < 10) {
      errors.push(`Row ${lineNumber}: Insufficient columns (expected 10, got ${values.length})`);
      return;
    }

    try {
      // Validate and parse date
      let formattedDate: string;
      const dateValue = values[0];
      
      if (!dateValue) {
        errors.push(`Row ${lineNumber}: Date is required`);
        return;
      }

      // Support multiple date formats
      if (dateValue.includes('/')) {
        // DD/MM/YYYY format
        const dateParts = dateValue.split('/');
        if (dateParts.length !== 3) {
          errors.push(`Row ${lineNumber}: Invalid date format '${dateValue}' (expected DD/MM/YYYY)`);
          return;
        }
        
        const day = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]);
        const year = parseInt(dateParts[2]);
        
        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
          errors.push(`Row ${lineNumber}: Invalid date values in '${dateValue}'`);
          return;
        }
        
        formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      } else if (dateValue.includes('-')) {
        // YYYY-MM-DD format (ISO)
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
          errors.push(`Row ${lineNumber}: Invalid ISO date format '${dateValue}'`);
          return;
        }
        formattedDate = dateValue;
      } else {
        errors.push(`Row ${lineNumber}: Unrecognized date format '${dateValue}' (supported: DD/MM/YYYY, YYYY-MM-DD)`);
        return;
      }

      // Parse and validate numeric values
      const parseNumericValue = (value: string, fieldName: string): number => {
        if (!value) return 0;
        
        // Clean up the value (remove parentheses, commas, spaces)
        const cleanValue = value.replace(/[(),\s]/g, '');
        const isNegative = value.includes('(');
        
        const parsed = parseFloat(cleanValue);
        if (isNaN(parsed)) {
          warnings.push(`Row ${lineNumber}: Invalid ${fieldName} '${value}', using 0`);
          return 0;
        }
        
        return isNegative ? -parsed : parsed;
      };

      const sha = parseNumericValue(values[1], 'SHA');
      const she = parseNumericValue(values[2], 'SHE');
      const csi300 = parseNumericValue(values[3], 'CSI300');
      const shares = parseNumericValue(values[4], 'shares');
      const shareValue = parseNumericValue(values[5], 'share value');
      const gainLoss = parseNumericValue(values[6], 'gain/loss');
      const dailyGain = parseNumericValue(values[7], 'daily gain');
      const marketValue = parseNumericValue(values[8], 'market value');
      const principle = parseNumericValue(values[9], 'principle');

      // Validate essential fields
      if (shareValue <= 0) {
        warnings.push(`Row ${lineNumber}: Share value must be positive (${shareValue}), skipping row`);
        return;
      }

      if (shares < 0) {
        warnings.push(`Row ${lineNumber}: Shares cannot be negative (${shares})`);
      }

      data.push({
        date: formattedDate,
        sha,
        she,
        csi300,
        shares,
        shareValue,
        gainLoss,
        dailyGain,
        marketValue,
        principle,
      });

    } catch (error) {
      errors.push(`Row ${lineNumber}: Parsing error - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Final validation
  if (data.length === 0 && errors.length === 0) {
    errors.push('No valid data rows found after parsing');
  }

  // Check for chronological order
  if (data.length > 1) {
    let isChronological = true;
    for (let i = 1; i < data.length; i++) {
      if (new Date(data[i].date) < new Date(data[i - 1].date)) {
        isChronological = false;
        break;
      }
    }
    if (!isChronological) {
      warnings.push('Data is not in chronological order - this may affect analysis accuracy');
    }
  }

  return { data, errors, warnings };
}

export function parsePortfolioData(data: unknown[]): PortfolioData[] {
  return data.slice(1).map(row => ({
    date: row[0],
    shareValue: parseFloat(row[1]) || 0,
    sha: parseFloat(row[2]) || 0,
    she: parseFloat(row[3]) || 0,
    csi300: parseFloat(row[4]) || 0,
    shares: parseFloat(row[5]) || 0,
    gainLoss: parseFloat(row[6]) || 0,
    dailyGain: parseFloat(row[7]) || 0,
    marketValue: parseFloat(row[8]) || 0,
    principle: parseFloat(row[9]) || 0,
  })).filter(row => row.shareValue > 0);
}

export function calculateCorrelation(values1: number[], values2: number[]): number {
  const n = Math.min(values1.length, values2.length);
  if (n === 0) return 0;

  const mean1 = values1.reduce((a, b) => a + b, 0) / n;
  const mean2 = values2.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let sum1 = 0;
  let sum2 = 0;

  for (let i = 0; i < n; i++) {
    const diff1 = values1[i] - mean1;
    const diff2 = values2[i] - mean2;
    numerator += diff1 * diff2;
    sum1 += diff1 * diff1;
    sum2 += diff2 * diff2;
  }

  const denominator = Math.sqrt(sum1 * sum2);
  return denominator === 0 ? 0 : numerator / denominator;
}

export function calculateCorrelations(data: PortfolioData[]): CorrelationData {
  const shareValues = data.map(d => d.shareValue);
  const shaValues = data.map(d => d.sha);
  const sheValues = data.map(d => d.she);
  const csi300Values = data.map(d => d.csi300);

  return {
    sha: calculateCorrelation(shareValues, shaValues),
    she: calculateCorrelation(shareValues, sheValues),
    csi300: calculateCorrelation(shareValues, csi300Values),
  };
}

export function calculateAnnualReturns(data: PortfolioData[]): AnnualReturn[] {
  const yearlyData = new Map<number, { first: PortfolioData; last: PortfolioData }>();

  data.forEach(row => {
    const year = new Date(row.date).getFullYear();
    if (!yearlyData.has(year)) {
      yearlyData.set(year, { first: row, last: row });
    } else {
      const existing = yearlyData.get(year)!;
      yearlyData.set(year, { first: existing.first, last: row });
    }
  });

  return Array.from(yearlyData.entries())
    .map(([year, { first, last }]) => ({
      year,
      fundReturn: ((last.shareValue - first.shareValue) / first.shareValue) * 100,
      shaReturn: ((last.sha - first.sha) / first.sha) * 100,
      sheReturn: ((last.she - first.she) / first.she) * 100,
      csi300Return: ((last.csi300 - first.csi300) / first.csi300) * 100,
    }))
    .sort((a, b) => a.year - b.year);
}

export function calculateOverallMetrics(data: PortfolioData[]) {
  if (data.length === 0) return null;

  const first = data[0];
  const last = data[data.length - 1];
  const years = (new Date(last.date).getTime() - new Date(first.date).getTime()) / (365.25 * 24 * 60 * 60 * 1000);

  const totalReturn = ((last.shareValue - first.shareValue) / first.shareValue) * 100;
  const annualizedReturn = (Math.pow(last.shareValue / first.shareValue, 1 / years) - 1) * 100;

  return {
    totalReturn,
    annualizedReturn,
    currentShareValue: last.shareValue,
    totalShares: last.shares,
    totalMarketValue: last.marketValue,
    totalGainLoss: last.gainLoss,
    totalPrinciple: last.principle,
  };
}

export function calculateRiskMetrics(data: PortfolioData[], riskFreeRate: number = 0.03): RiskMetrics {
  if (data.length < 2) return {
    sharpeRatio: 0,
    maxDrawdown: 0,
    volatility: 0,
    downsideDeviation: 0,
    sortinioRatio: 0,
  };

  // Calculate daily returns
  const dailyReturns: number[] = [];
  for (let i = 1; i < data.length; i++) {
    const returnRate = (data[i].shareValue - data[i - 1].shareValue) / data[i - 1].shareValue;
    dailyReturns.push(returnRate);
  }

  // Calculate volatility (annualized standard deviation)
  const meanReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
  const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / dailyReturns.length;
  const volatility = Math.sqrt(variance * 252) * 100; // Annualized volatility as percentage

  // Calculate Sharpe Ratio
  const annualizedReturn = meanReturn * 252 * 100; // Convert to annualized percentage
  const excessReturn = annualizedReturn - (riskFreeRate * 100);
  const sharpeRatio = volatility !== 0 ? excessReturn / volatility : 0;

  // Calculate Maximum Drawdown
  let maxDrawdown = 0;
  let peak = data[0].shareValue;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i].shareValue > peak) {
      peak = data[i].shareValue;
    }
    const drawdown = (peak - data[i].shareValue) / peak * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  // Calculate downside deviation (for negative returns only)
  const negativeReturns = dailyReturns.filter(ret => ret < 0);
  let downsideDeviation = 0;
  if (negativeReturns.length > 0) {
    const downsideVariance = negativeReturns.reduce((sum, ret) => sum + Math.pow(ret, 2), 0) / negativeReturns.length;
    downsideDeviation = Math.sqrt(downsideVariance * 252) * 100; // Annualized
  }

  // Calculate Sortino Ratio
  const sortinioRatio = downsideDeviation !== 0 ? excessReturn / downsideDeviation : 0;

  return {
    sharpeRatio: Number(sharpeRatio.toFixed(3)),
    maxDrawdown: Number(maxDrawdown.toFixed(2)),
    volatility: Number(volatility.toFixed(2)),
    downsideDeviation: Number(downsideDeviation.toFixed(2)),
    sortinioRatio: Number(sortinioRatio.toFixed(3)),
  };
}

export function calculateBenchmarkComparisons(data: PortfolioData[]): BenchmarkComparison[] {
  if (data.length < 2) return [];

  const benchmarks = [
    { name: 'SHA', values: data.map(d => d.sha) },
    { name: 'SHE', values: data.map(d => d.she) },
    { name: 'CSI300', values: data.map(d => d.csi300) },
  ];

  const portfolioValues = data.map(d => d.shareValue);
  
  return benchmarks.map(benchmark => {
    // Calculate returns
    const portfolioReturns = calculateReturns(portfolioValues);
    const benchmarkReturns = calculateReturns(benchmark.values);
    
    // Calculate total returns
    const portfolioTotalReturn = ((portfolioValues[portfolioValues.length - 1] - portfolioValues[0]) / portfolioValues[0]) * 100;
    const benchmarkTotalReturn = ((benchmark.values[benchmark.values.length - 1] - benchmark.values[0]) / benchmark.values[0]) * 100;
    
    // Calculate beta
    const beta = calculateBeta(portfolioReturns, benchmarkReturns);
    
    // Calculate alpha (portfolio return - (risk-free rate + beta * (benchmark return - risk-free rate)))
    // Assuming risk-free rate of 3%
    const riskFreeRate = 3;
    const alpha = portfolioTotalReturn - (riskFreeRate + beta * (benchmarkTotalReturn - riskFreeRate));
    
    // Calculate tracking error
    const trackingError = calculateTrackingError(portfolioReturns, benchmarkReturns);
    
    // Calculate active return
    const activeReturn = portfolioTotalReturn - benchmarkTotalReturn;
    
    // Calculate information ratio
    const informationRatio = trackingError !== 0 ? activeReturn / trackingError : 0;
    
    return {
      benchmark: benchmark.name,
      portfolioReturn: Number(portfolioTotalReturn.toFixed(2)),
      benchmarkReturn: Number(benchmarkTotalReturn.toFixed(2)),
      alpha: Number(alpha.toFixed(2)),
      beta: Number(beta.toFixed(3)),
      trackingError: Number(trackingError.toFixed(2)),
      informationRatio: Number(informationRatio.toFixed(3)),
      activeReturn: Number(activeReturn.toFixed(2)),
    };
  });
}

function calculateReturns(values: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1] !== 0) {
      returns.push((values[i] - values[i - 1]) / values[i - 1]);
    }
  }
  return returns;
}

function calculateBeta(portfolioReturns: number[], benchmarkReturns: number[]): number {
  const minLength = Math.min(portfolioReturns.length, benchmarkReturns.length);
  if (minLength === 0) return 0;
  
  const portfolioMean = portfolioReturns.slice(0, minLength).reduce((a, b) => a + b, 0) / minLength;
  const benchmarkMean = benchmarkReturns.slice(0, minLength).reduce((a, b) => a + b, 0) / minLength;
  
  let covariance = 0;
  let benchmarkVariance = 0;
  
  for (let i = 0; i < minLength; i++) {
    const portfolioDiff = portfolioReturns[i] - portfolioMean;
    const benchmarkDiff = benchmarkReturns[i] - benchmarkMean;
    covariance += portfolioDiff * benchmarkDiff;
    benchmarkVariance += benchmarkDiff * benchmarkDiff;
  }
  
  return benchmarkVariance !== 0 ? covariance / benchmarkVariance : 0;
}

function calculateTrackingError(portfolioReturns: number[], benchmarkReturns: number[]): number {
  const minLength = Math.min(portfolioReturns.length, benchmarkReturns.length);
  if (minLength === 0) return 0;
  
  const excessReturns: number[] = [];
  for (let i = 0; i < minLength; i++) {
    excessReturns.push(portfolioReturns[i] - benchmarkReturns[i]);
  }
  
  const mean = excessReturns.reduce((a, b) => a + b, 0) / excessReturns.length;
  const variance = excessReturns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / excessReturns.length;
  
  return Math.sqrt(variance * 252) * 100; // Annualized tracking error as percentage
}

export function calculateDrawdownAnalysis(data: PortfolioData[]): DrawdownAnalysis {
  if (data.length < 2) {
    return {
      maxDrawdown: {
        startDate: '',
        endDate: '',
        peakValue: 0,
        troughValue: 0,
        drawdownPercent: 0,
        durationDays: 0,
      },
      allDrawdowns: [],
      averageDrawdown: 0,
      averageRecoveryTime: 0,
    };
  }

  const drawdowns: DrawdownPeriod[] = [];
  let currentPeak = data[0].shareValue;
  let currentPeakDate = data[0].date;
  let inDrawdown = false;
  let drawdownStart = '';
  let maxDrawdownPercent = 0;
  let maxDrawdownIndex = 0;

  for (let i = 1; i < data.length; i++) {
    const currentValue = data[i].shareValue;
    const currentDate = data[i].date;

    if (currentValue > currentPeak) {
      // New peak - end current drawdown if in one
      if (inDrawdown) {
        const drawdownPeriod = createDrawdownPeriod(
          drawdownStart,
          data[maxDrawdownIndex].date,
          currentDate,
          currentPeak,
          data[maxDrawdownIndex].shareValue,
          maxDrawdownPercent
        );
        drawdowns.push(drawdownPeriod);
        inDrawdown = false;
      }
      
      currentPeak = currentValue;
      currentPeakDate = currentDate;
      maxDrawdownPercent = 0;
    } else {
      // Potential drawdown
      const drawdownPercent = ((currentPeak - currentValue) / currentPeak) * 100;
      
      if (drawdownPercent > 0.1) { // Only consider drawdowns > 0.1%
        if (!inDrawdown) {
          inDrawdown = true;
          drawdownStart = currentPeakDate;
          maxDrawdownPercent = drawdownPercent;
          maxDrawdownIndex = i;
        } else if (drawdownPercent > maxDrawdownPercent) {
          maxDrawdownPercent = drawdownPercent;
          maxDrawdownIndex = i;
        }
      }
    }
  }

  // Handle ongoing drawdown
  let currentDrawdown: DrawdownPeriod | undefined;
  if (inDrawdown) {
    currentDrawdown = createDrawdownPeriod(
      drawdownStart,
      data[maxDrawdownIndex].date,
      undefined,
      currentPeak,
      data[maxDrawdownIndex].shareValue,
      maxDrawdownPercent
    );
    drawdowns.push(currentDrawdown);
  }

  // Find maximum drawdown
  let maxDrawdown = drawdowns[0] || {
    startDate: '',
    endDate: '',
    peakValue: 0,
    troughValue: 0,
    drawdownPercent: 0,
    durationDays: 0,
  };

  drawdowns.forEach(dd => {
    if (dd.drawdownPercent > maxDrawdown.drawdownPercent) {
      maxDrawdown = dd;
    }
  });

  // Calculate averages
  const completedDrawdowns = drawdowns.filter(dd => dd.recoveryDate);
  const averageDrawdown = drawdowns.length > 0 
    ? drawdowns.reduce((sum, dd) => sum + dd.drawdownPercent, 0) / drawdowns.length 
    : 0;
  const averageRecoveryTime = completedDrawdowns.length > 0 
    ? completedDrawdowns.reduce((sum, dd) => sum + (dd.recoveryDays || 0), 0) / completedDrawdowns.length 
    : 0;

  return {
    maxDrawdown,
    allDrawdowns: drawdowns,
    averageDrawdown: Number(averageDrawdown.toFixed(2)),
    averageRecoveryTime: Number(averageRecoveryTime.toFixed(0)),
    currentDrawdown: currentDrawdown,
  };
}

function createDrawdownPeriod(
  startDate: string,
  endDate: string,
  recoveryDate: string | undefined,
  peakValue: number,
  troughValue: number,
  drawdownPercent: number
): DrawdownPeriod {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationDays = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  
  let recoveryDays: number | undefined;
  if (recoveryDate) {
    const recovery = new Date(recoveryDate);
    recoveryDays = Math.ceil((recovery.getTime() - end.getTime()) / (24 * 60 * 60 * 1000));
  }

  return {
    startDate,
    endDate,
    recoveryDate,
    peakValue,
    troughValue,
    drawdownPercent: Number(drawdownPercent.toFixed(2)),
    durationDays,
    recoveryDays,
  };
}
