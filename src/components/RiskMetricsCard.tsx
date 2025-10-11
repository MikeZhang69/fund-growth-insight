import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingDown, BarChart3, AlertTriangle } from "lucide-react";
import { RiskMetrics } from "@/utils/portfolioAnalysis";

interface RiskMetricsCardProps {
  riskMetrics: RiskMetrics;
}

export function RiskMetricsCard({ riskMetrics }: RiskMetricsCardProps) {
  const getSharpeRating = (sharpe: number) => {
    if (sharpe > 1.5) return { label: "Excellent", color: "bg-green-600" };
    if (sharpe > 1.0) return { label: "Good", color: "bg-blue-600" };
    if (sharpe > 0.5) return { label: "Fair", color: "bg-yellow-600" };
    return { label: "Poor", color: "bg-red-600" };
  };

  const getDrawdownRating = (drawdown: number) => {
    if (drawdown < 5) return { label: "Low Risk", color: "bg-green-600" };
    if (drawdown < 15) return { label: "Moderate Risk", color: "bg-yellow-600" };
    if (drawdown < 25) return { label: "High Risk", color: "bg-orange-600" };
    return { label: "Very High Risk", color: "bg-red-600" };
  };

  const sharpeRating = getSharpeRating(riskMetrics.sharpeRatio);
  const drawdownRating = getDrawdownRating(riskMetrics.maxDrawdown);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Risk Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sharpe Ratio */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sharpe Ratio</span>
            </div>
            <Badge className={sharpeRating.color} variant="secondary">
              {sharpeRating.label}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{riskMetrics.sharpeRatio}</span>
            <span className="text-xs text-muted-foreground">Risk-adjusted return</span>
          </div>
        </div>

        {/* Maximum Drawdown */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Max Drawdown</span>
            </div>
            <Badge className={drawdownRating.color} variant="secondary">
              {drawdownRating.label}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-red-600">-{riskMetrics.maxDrawdown}%</span>
            <span className="text-xs text-muted-foreground">Worst decline</span>
          </div>
        </div>

        {/* Volatility */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Volatility (Annualized)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{riskMetrics.volatility}%</span>
            <span className="text-xs text-muted-foreground">Standard deviation</span>
          </div>
        </div>

        {/* Sortino Ratio */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Sortino Ratio</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{riskMetrics.sortinioRatio}</span>
            <span className="text-xs text-muted-foreground">Downside risk-adjusted</span>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 gap-3 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Downside Deviation:</span>
            <span className="font-medium">{riskMetrics.downsideDeviation}%</span>
          </div>
        </div>

        {/* Risk Interpretation */}
        <div className="bg-muted/50 rounded-lg p-3 mt-4">
          <h4 className="text-sm font-semibold mb-2">Risk Summary</h4>
          <div className="text-xs space-y-1 text-muted-foreground">
            <p><strong>Sharpe Ratio:</strong> Measures risk-adjusted returns (higher is better)</p>
            <p><strong>Max Drawdown:</strong> Largest peak-to-trough decline</p>
            <p><strong>Sortino Ratio:</strong> Like Sharpe but only considers downside risk</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}