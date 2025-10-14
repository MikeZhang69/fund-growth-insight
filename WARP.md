# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Fund Growth Insight is a **React-based portfolio analysis application** built with Lovable. It provides comprehensive financial data visualization and analysis for investment portfolios, focusing on Chinese market benchmarks (SHA, SHE, CSI300).

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Charts**: Recharts for data visualization
- **State Management**: React hooks (useState, useEffect)
- **Data Processing**: Custom utilities for CSV parsing and financial calculations

## Common Development Commands

```bash
# Development server (runs on port 8080)
npm run dev

# Production build
npm run build

# Development build
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Architecture Overview

### Core Application Structure

The application follows a **single-page architecture** with modular components:

- **Entry Point**: `src/pages/Index.tsx` - Main dashboard that orchestrates all components
- **Data Layer**: `src/utils/portfolioAnalysis.ts` - Central financial calculation engine
- **Component Layer**: `src/components/` - Reusable UI components for specific analysis types

### Key Data Flow

1. **CSV Data Loading**: App loads default portfolio data from `/public/PORTFOLIO_SNAPSHOT.csv` or accepts user uploads
2. **Data Processing**: `portfolioAnalysis.ts` transforms raw CSV into structured `PortfolioData[]`
3. **Metric Calculations**: Multiple calculation functions generate analytics (correlations, returns, risk metrics)
4. **Component Rendering**: Specialized components display different aspects of the analysis

### Financial Analysis Components

The codebase is organized around specific financial analysis types:

- **`PerformanceChart`**: Time series visualization of portfolio vs benchmarks
- **`MetricCard`**: Key performance indicators display
- **`CorrelationCard`**: Market correlation analysis
- **`RiskMetricsCard`**: Risk assessment (Sharpe ratio, drawdown, volatility)
- **`BenchmarkComparisonCard`**: Alpha, beta, and tracking error analysis
- **`DrawdownAnalysisCard`**: Maximum drawdown and recovery analysis
- **`InvestmentBehaviorAnalysis`**: Behavioral patterns and timing analysis
- **`InvestmentAnalysis`**: Investment recommendation engine

### Data Types & Interfaces

Critical interfaces defined in `portfolioAnalysis.ts`:
- **`PortfolioData`**: Core time series data structure
- **`RiskMetrics`**: Risk calculation results
- **`BenchmarkComparison`**: Comparative analysis data
- **`DrawdownAnalysis`**: Drawdown period analysis

### CSV Data Format

The application expects CSV files with the following structure:
- Row 1: Sheet identifier (skipped)
- Row 2: Headers (skipped)  
- Data rows: Date, SHA, SHE, CSI300, Shares, ShareValue, GainLoss, DailyGain, MarketValue, Principle

**Supported date formats**: DD/MM/YYYY or YYYY-MM-DD

## Development Notes

### File Upload Functionality
- Default data loads from `/public/PORTFOLIO_SNAPSHOT.csv`
- Users can upload custom CSV files via `FileUpload` component
- CSV parsing includes validation and error handling

### Styling System
- Uses **shadcn/ui** component library with Radix UI primitives
- **Tailwind CSS** for utility-first styling
- Custom color scheme with CSS variables in theme configuration
- Responsive design with mobile-first approach

### Component Props Pattern
Components receive calculated data as props rather than performing calculations internally. This keeps components pure and calculations centralized in `portfolioAnalysis.ts`.

### Error Handling
- CSV parsing includes comprehensive validation with error/warning reporting
- Loading states handled throughout the application
- Graceful fallbacks for missing or invalid data

### Development Server Configuration
- Vite dev server runs on `::` (all interfaces) at port 8080
- Path alias `@` maps to `./src` directory
- SWC used for fast React compilation
- Lovable component tagger enabled in development mode

## Key Financial Calculations

The `portfolioAnalysis.ts` module provides these core calculations:
- **Annual Returns**: Year-over-year performance analysis
- **Risk Metrics**: Sharpe ratio, Sortino ratio, maximum drawdown, volatility
- **Correlation Analysis**: Portfolio correlation with market benchmarks
- **Benchmark Comparisons**: Alpha, beta, tracking error, information ratio
- **Drawdown Analysis**: Peak-to-trough analysis with recovery periods