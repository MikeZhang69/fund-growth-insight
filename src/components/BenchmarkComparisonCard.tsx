import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, Activity } from "lucide-react";
import { BenchmarkComparison } from "@/utils/portfolioAnalysis";

interface BenchmarkComparisonCardProps {
  comparisons: BenchmarkComparison[];
}

export const BenchmarkComparisonCard = ({ comparisons }: BenchmarkComparisonCardProps) => {
  if (comparisons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Benchmark Comparison
          </CardTitle>
          <CardDescription>No benchmark data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getBadgeVariant = (value: number) => {
    if (value > 0) return "default";
    if (value < 0) return "destructive";
    return "secondary";
  };

  const getIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="h-4 w-4" />
    ) : (
      <TrendingDown className="h-4 w-4" />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Benchmark Comparison
        </CardTitle>
        <CardDescription>Performance vs market indices</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {comparisons.map((comparison) => (
          <div key={comparison.benchmark} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">{comparison.benchmark} Index</h4>
              <Badge variant={getBadgeVariant(comparison.activeReturn)}>
                {comparison.activeReturn >= 0 ? "+" : ""}
                {comparison.activeReturn}% Active Return
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Portfolio Return:</span>
                  <span className="flex items-center gap-1">
                    {getIcon(comparison.portfolioReturn)}
                    {comparison.portfolioReturn}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Benchmark Return:</span>
                  <span className="flex items-center gap-1">
                    {getIcon(comparison.benchmarkReturn)}
                    {comparison.benchmarkReturn}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alpha:</span>
                  <span className="flex items-center gap-1">
                    {getIcon(comparison.alpha)}
                    {comparison.alpha}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Beta:</span>
                  <span>{comparison.beta}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tracking Error:</span>
                  <span>{comparison.trackingError}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Info Ratio:</span>
                  <span className="flex items-center gap-1">
                    {getIcon(comparison.informationRatio)}
                    {comparison.informationRatio}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Performance interpretation */}
            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-2">
                <Activity className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">
                  <p>
                    <strong>Beta {comparison.beta}</strong>: 
                    {comparison.beta > 1.1 ? " More volatile than benchmark" : 
                     comparison.beta < 0.9 ? " Less volatile than benchmark" : 
                     " Similar volatility to benchmark"}
                  </p>
                  <p className="mt-1">
                    <strong>Alpha {comparison.alpha}%</strong>: 
                    {comparison.alpha > 2 ? " Strong outperformance" : 
                     comparison.alpha > 0 ? " Modest outperformance" :
                     comparison.alpha < -2 ? " Significant underperformance" :
                     " In line with expected returns"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};