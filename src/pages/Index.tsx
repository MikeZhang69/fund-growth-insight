import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, PieChart, Activity } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { PerformanceChart } from "@/components/PerformanceChart";
import { AnnualReturnsTable } from "@/components/AnnualReturnsTable";
import { CorrelationCard } from "@/components/CorrelationCard";
import { InvestmentAnalysis } from "@/components/InvestmentAnalysis";
import { InvestmentBehaviorAnalysis } from "@/components/InvestmentBehaviorAnalysis";
import { FileUpload } from "@/components/FileUpload";
import { RiskMetricsCard } from "@/components/RiskMetricsCard";
import { MarketIndicesExport } from "@/components/MarketIndicesExport";
import { BenchmarkComparisonCard } from "@/components/BenchmarkComparisonCard";
import { DrawdownAnalysisCard } from "@/components/DrawdownAnalysisCard";
import {
  parseCSV,
  parseCSVWithValidation,
  calculateCorrelations,
  calculateAnnualReturns,
  calculateOverallMetrics,
  calculateRiskMetrics,
  calculateBenchmarkComparisons,
  calculateDrawdownAnalysis,
  PortfolioData,
  RiskMetrics,
} from "@/utils/portfolioAnalysis";

const Index = () => {
  const [data, setData] = useState<PortfolioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasUploadedFile, setHasUploadedFile] = useState(false);

  useEffect(() => {
    const loadDefaultData = async () => {
      try {
        const response = await fetch("/PORTFOLIO_SNAPSHOT.csv");
        const csvText = await response.text();
        const parsedData = parseCSV(csvText);
        setData(parsedData);
      } catch (error) {
        console.error("Error loading portfolio data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!hasUploadedFile) {
      loadDefaultData();
    }
  }, [hasUploadedFile]);

  const handleFileUpload = (csvText: string) => {
    try {
      const parsedData = parseCSV(csvText);
      setData(parsedData);
      setHasUploadedFile(true);
      setLoading(false);
    } catch (error) {
      console.error("Error parsing uploaded file:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading Portfolio Data...</h2>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Error Loading Data</h2>
          <p className="text-muted-foreground mt-2">Please check the data file.</p>
        </div>
      </div>
    );
  }

  const metrics = calculateOverallMetrics(data);
  const correlations = calculateCorrelations(data);
  const annualReturns = calculateAnnualReturns(data);
  const riskMetrics = calculateRiskMetrics(data);
  const benchmarkComparisons = calculateBenchmarkComparisons(data);
  const drawdownAnalysis = calculateDrawdownAnalysis(data);

  if (!metrics) return null;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Portfolio Performance Analysis</h1>
          <p className="text-muted-foreground">
            Comprehensive analysis from 2014 to 2025
          </p>
        </div>

        <FileUpload onFileLoad={handleFileUpload} />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Current Share Value"
            value={`¥${metrics.currentShareValue.toFixed(4)}`}
            icon={DollarSign}
          />
          <MetricCard
            title="Annualized Return"
            value={`${metrics.annualizedReturn.toFixed(2)}%`}
            icon={TrendingUp}
            trend={metrics.annualizedReturn}
          />
          <MetricCard
            title="Total Return"
            value={`${metrics.totalReturn.toFixed(2)}%`}
            icon={Activity}
            trend={metrics.totalReturn}
          />
          <MetricCard
            title="Total Gain/Loss"
            value={`¥${metrics.totalGainLoss.toLocaleString()}`}
            icon={PieChart}
          />
        </div>

        <PerformanceChart data={data} />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CorrelationCard correlations={correlations} />
          <RiskMetricsCard riskMetrics={riskMetrics} />
          <InvestmentAnalysis
            annualizedReturn={metrics.annualizedReturn}
            totalReturn={metrics.totalReturn}
            correlations={correlations}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          <BenchmarkComparisonCard comparisons={benchmarkComparisons} />
          <DrawdownAnalysisCard drawdownAnalysis={drawdownAnalysis} />
        </div>

        <InvestmentBehaviorAnalysis data={data} />

        <MarketIndicesExport className="mb-8" />

        <AnnualReturnsTable returns={annualReturns} />
      </div>
    </div>
  );
};

export default Index;
