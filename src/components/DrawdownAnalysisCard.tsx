import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, Calendar, Clock, AlertTriangle, BarChart3 } from "lucide-react";
import { DrawdownAnalysis } from "@/utils/portfolioAnalysis";
import { format, parseISO } from "date-fns";

interface DrawdownAnalysisCardProps {
  drawdownAnalysis: DrawdownAnalysis;
}

export const DrawdownAnalysisCard = ({ drawdownAnalysis }: DrawdownAnalysisCardProps) => {
  const { maxDrawdown, allDrawdowns, averageDrawdown, averageRecoveryTime, currentDrawdown } = drawdownAnalysis;

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const getDrawdownSeverity = (percentage: number) => {
    if (percentage >= 20) return { variant: "destructive" as const, label: "Severe" };
    if (percentage >= 10) return { variant: "secondary" as const, label: "Moderate" };
    if (percentage >= 5) return { variant: "outline" as const, label: "Minor" };
    return { variant: "default" as const, label: "Minimal" };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Drawdown Analysis
        </CardTitle>
        <CardDescription>
          Portfolio decline periods and recovery analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Drawdown Alert */}
        {currentDrawdown && (
          <div className="border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20 p-4 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Currently in Drawdown
              </span>
            </div>
            <div className="text-sm text-orange-700 dark:text-orange-300">
              <p>Started: {formatDate(currentDrawdown.startDate)}</p>
              <p>Current drawdown: -{currentDrawdown.drawdownPercent}%</p>
              <p>Duration: {currentDrawdown.durationDays} days</p>
            </div>
          </div>
        )}

        {/* Maximum Drawdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Maximum Drawdown</h4>
            <Badge variant={getDrawdownSeverity(maxDrawdown.drawdownPercent).variant}>
              -{maxDrawdown.drawdownPercent}% {getDrawdownSeverity(maxDrawdown.drawdownPercent).label}
            </Badge>
          </div>
          
          {maxDrawdown.drawdownPercent > 0 && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peak Value:</span>
                  <span>¥{maxDrawdown.peakValue.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trough Value:</span>
                  <span>¥{maxDrawdown.troughValue.toFixed(4)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {maxDrawdown.durationDays} days
                  </span>
                </div>
                {maxDrawdown.recoveryDays && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recovery:</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {maxDrawdown.recoveryDays} days
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {maxDrawdown.drawdownPercent > 0 && (
            <div className="text-xs text-muted-foreground">
              <p>
                <strong>Period:</strong> {formatDate(maxDrawdown.startDate)} to {formatDate(maxDrawdown.endDate)}
                {maxDrawdown.recoveryDate && (
                  <span> (recovered {formatDate(maxDrawdown.recoveryDate)})</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Summary Statistics
          </h4>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-semibold">{allDrawdowns.length}</div>
              <div className="text-muted-foreground">Total Drawdowns</div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-semibold">-{averageDrawdown}%</div>
              <div className="text-muted-foreground">Avg Drawdown</div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-semibold">{averageRecoveryTime}</div>
              <div className="text-muted-foreground">Avg Recovery (days)</div>
            </div>
          </div>
        </div>

        {/* Drawdown History */}
        {allDrawdowns.length > 1 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Recent Drawdown History</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {allDrawdowns
                .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                .slice(0, 5)
                .map((drawdown, index) => (
                  <div key={`${drawdown.startDate}-${index}`} className="flex justify-between items-center p-2 border rounded-lg">
                    <div className="text-xs">
                      <div className="font-medium">{formatDate(drawdown.startDate)}</div>
                      <div className="text-muted-foreground">
                        {drawdown.durationDays} days
                        {drawdown.recoveryDays && ` (+${drawdown.recoveryDays} recovery)`}
                      </div>
                    </div>
                    <Badge variant={getDrawdownSeverity(drawdown.drawdownPercent).variant} className="text-xs">
                      -{drawdown.drawdownPercent}%
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Analysis Insights */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="text-xs text-muted-foreground">
            <p>
              <strong>Analysis:</strong>
              {maxDrawdown.drawdownPercent > 30 ? " High risk profile with significant volatility" :
               maxDrawdown.drawdownPercent > 15 ? " Moderate risk with notable drawdown periods" :
               maxDrawdown.drawdownPercent > 5 ? " Relatively stable with minor volatility" :
               " Very stable with minimal downside risk"}
            </p>
            {averageRecoveryTime > 0 && (
              <p className="mt-1">
                <strong>Recovery Pattern:</strong>
                {averageRecoveryTime > 365 ? " Slow recovery, typically over a year" :
                 averageRecoveryTime > 180 ? " Moderate recovery, typically 6-12 months" :
                 averageRecoveryTime > 90 ? " Good recovery, typically 3-6 months" :
                 " Quick recovery, typically under 3 months"}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};