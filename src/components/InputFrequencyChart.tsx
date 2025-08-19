import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface InputFrequencyChartProps {
  data: any[];
  title: string;
  height?: number;
}

export function InputFrequencyChart({ data, title, height = 400 }: InputFrequencyChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Count inputs per date
    const dateCounts: { [key: string]: number } = {};
    
    data.forEach(row => {
      const date = row.dates || row.date;
      if (!date) return;
      
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });
    
    // Convert to chart format and sort by date
    return Object.entries(dateCounts)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date,
        inputs: count,
        formattedInputs: count.toLocaleString()
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-card-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-1">{label}</p>
          <p className="text-sm text-primary">
            Daily Inputs: {data.formattedInputs}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!chartData.length) {
    return (
      <Card className="p-6 bg-gradient-card border-card-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
          No data available. Please upload a CSV file.
        </div>
      </Card>
    );
  }

  const maxInputs = Math.max(...chartData.map(d => d.inputs));
  const avgInputs = Math.round(chartData.reduce((sum, d) => sum + d.inputs, 0) / chartData.length);

  return (
    <Card className="p-6 bg-gradient-card border-card-border shadow-card">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className="text-sm text-muted-foreground space-y-1">
          <div>Avg: {avgInputs.toLocaleString()} inputs/day</div>
          <div>Peak: {maxInputs.toLocaleString()} inputs/day</div>
        </div>
      </div>
      
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="inputs" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}