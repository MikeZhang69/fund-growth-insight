import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortfolioData } from '@/utils/portfolioAnalysis';
import { useState, useEffect, useMemo } from 'react';
import type { TooltipProps } from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

type ChartPoint = {
  date: string;
  tooltipLabel: string;
  Fund: number;
  SHA: number;
  SHE: number;
  CSI300: number;
  fundActual: number;
  shaActual: number;
  sheActual: number;
  csiActual: number;
};

interface PerformanceChartProps {
  data: PortfolioData[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const chartData = useMemo<ChartPoint[]>(() => {
    if (data.length === 0) {
      return [];
    }

    const [baseShare, baseSHA, baseSHE, baseCSI] = [
      data[0].shareValue,
      data[0].sha,
      data[0].she,
      data[0].csi300,
    ];

    return data
      .filter((_, index) => index % (isMobile ? 60 : 30) === 0)
      .map(row => {
        const dateObject = new Date(row.date);
        const tooltipLabel = new Intl.DateTimeFormat('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).format(dateObject);

        return {
          date: row.date,
          tooltipLabel,
          Fund: Number(((row.shareValue / baseShare - 1) * 100).toFixed(2)),
          SHA: Number(((row.sha / baseSHA - 1) * 100).toFixed(2)),
          SHE: Number(((row.she / baseSHE - 1) * 100).toFixed(2)),
          CSI300: Number(((row.csi300 / baseCSI - 1) * 100).toFixed(2)),
          fundActual: row.shareValue,
          shaActual: row.sha,
          sheActual: row.she,
          csiActual: row.csi300,
        };
      });
  }, [data, isMobile]);

  const { domain, ticks } = useMemo(() => {
    if (chartData.length === 0) {
      return { domain: ['auto', 'auto'] as ['auto', 'auto'], ticks: undefined as number[] | undefined };
    }

    const allValues = chartData.flatMap(point => [point.Fund, point.SHA, point.SHE, point.CSI300]);
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const buffer = 5;
    const niceMin = Math.floor((minValue - buffer) / 5) * 5;
    const niceMax = Math.ceil((maxValue + buffer) / 5) * 5;
    const tickSegments = isMobile ? 4 : 6;
    const rawStep = (niceMax - niceMin) / tickSegments;
    const step = Math.max(5, Math.ceil(rawStep / 5) * 5);

    const generatedTicks: number[] = [];
    for (let tick = niceMin; tick <= niceMax; tick += step) {
      generatedTicks.push(Math.round(tick));
    }

    return {
      domain: [generatedTicks[0] ?? niceMin, generatedTicks[generatedTicks.length - 1] ?? niceMax] as [number, number],
      ticks: generatedTicks,
    };
  }, [chartData, isMobile]);

  const customTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    const valueFormatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const firstPayload = payload[0]?.payload as ChartPoint | undefined;
    const labelText = firstPayload?.tooltipLabel ?? '';

    const actualFieldMap: Record<string, keyof ChartPoint> = {
      Fund: 'fundActual',
      SHA: 'shaActual',
      SHE: 'sheActual',
      CSI300: 'csiActual',
    };

    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        {labelText && <p className="text-sm font-medium mb-2">{labelText}</p>}
        {payload.map(entry => {
          if (!entry || !entry.dataKey) {
            return null;
          }

          const key = entry.dataKey.toString();
          const actualField = actualFieldMap[key];
          const actualValue = actualField && firstPayload ? firstPayload[actualField] : undefined;

          if (typeof actualValue !== 'number') {
            return null;
          }

          return (
            <p key={key} className="text-sm" style={{ color: entry.color || 'inherit' }}>
              {`${key}: ${valueFormatter.format(actualValue)}`}
            </p>
          );
        })}
      </div>
    );
  };

  const formatYAxisTick = (value: number) => {
    const formatted = Math.abs(value) < 10 ? value.toFixed(1) : Math.round(value).toString();
    return `${formatted}%`;
  };

  const formatXAxisTick = (value: string) => {
    const dateObject = new Date(value);
    if (Number.isNaN(dateObject.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: isMobile ? '2-digit' : 'numeric',
    }).format(dateObject);
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Historical Performance Comparison</CardTitle>
      </CardHeader>
      <CardContent className="px-2 md:px-6">
        <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
          <LineChart data={chartData} margin={{ top: 5, right: isMobile ? 10 : 30, left: isMobile ? 10 : 20, bottom: isMobile ? 60 : 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
            <XAxis 
              dataKey="date" 
              angle={-45}
              textAnchor="end"
              height={isMobile ? 50 : 70}
              fontSize={isMobile ? 10 : 12}
              interval="preserveStartEnd"
              minTickGap={isMobile ? 20 : 40}
              tickFormatter={formatXAxisTick}
            />
            <YAxis 
              label={isMobile ? undefined : { value: 'Return (%)', angle: -90, position: 'insideLeft' }} 
              domain={domain}
              ticks={ticks}
              tickFormatter={formatYAxisTick}
              fontSize={isMobile ? 10 : 12}
              width={isMobile ? 44 : 60}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={customTooltip} />
            {!isMobile && <Legend />}
            <Line 
              type="monotone" 
              dataKey="Fund" 
              stroke="hsl(var(--primary))" 
              strokeWidth={isMobile ? 2 : 2}
              dot={false}
              name="Portfolio Fund"
            />
            <Line 
              type="monotone" 
              dataKey="SHA" 
              stroke="hsl(var(--chart-1))" 
              strokeWidth={isMobile ? 1 : 1.5}
              dot={false}
              name="Shanghai Composite"
            />
            <Line 
              type="monotone" 
              dataKey="SHE" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={isMobile ? 1 : 1.5}
              dot={false}
              name="Shenzhen Component"
            />
            <Line 
              type="monotone" 
              dataKey="CSI300" 
              stroke="hsl(var(--chart-3))" 
              strokeWidth={isMobile ? 1 : 1.5}
              dot={false}
              name="CSI 300"
            />
          </LineChart>
        </ResponsiveContainer>
        {isMobile && (
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-primary"></div>
              <span>Portfolio Fund</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5" style={{ backgroundColor: 'hsl(var(--chart-1))' }}></div>
              <span>Shanghai</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5" style={{ backgroundColor: 'hsl(var(--chart-2))' }}></div>
              <span>Shenzhen</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5" style={{ backgroundColor: 'hsl(var(--chart-3))' }}></div>
              <span>CSI 300</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
