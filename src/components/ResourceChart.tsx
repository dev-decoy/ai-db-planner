import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ResourceChartProps {
  data: any[];
  title: string;
  height?: number;
}

export function ResourceChart({ data, title, height = 400 }: ResourceChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Group data by date and calculate averages
    const dateGroups: { [key: string]: any[] } = {};
    
    data.forEach(row => {
      const date = row.dates || row.date;
      if (!date) return;
      
      if (!dateGroups[date]) {
        dateGroups[date] = [];
      }
      dateGroups[date].push(row);
    });
    
    // Calculate daily averages
    return Object.entries(dateGroups).map(([date, rows]) => {
      const cpu = rows.reduce((sum, row) => sum + (parseFloat(row.cpu_usage) || 0), 0) / rows.length;
      const memory = rows.reduce((sum, row) => sum + (parseFloat(row.memory_usage) || 0), 0) / rows.length;
      const network = rows.reduce((sum, row) => sum + (parseFloat(row.network_traffic) || 0), 0) / rows.length;
      const power = rows.reduce((sum, row) => sum + (parseFloat(row.power_consumption) || 0), 0) / rows.length;
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date,
        cpu: Math.round(cpu * 100) / 100,
        memory: Math.round(memory * 100) / 100,
        network: Math.round(network / 1000000 * 100) / 100, // Convert to MB
        power: Math.round(power / 1000 * 100) / 100, // Convert to KW
        inputCount: rows.length
      };
    }).sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-card-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.dataKey === 'cpu' || entry.dataKey === 'memory' ? '%' : 
               entry.dataKey === 'network' ? ' MB/s' :
               entry.dataKey === 'power' ? ' KW' : ''}
            </p>
          ))}
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

  return (
    <Card className="p-6 bg-gradient-card border-card-border shadow-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="cpu" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="CPU Usage (%)"
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="memory" 
              stroke="hsl(var(--accent))" 
              strokeWidth={2}
              name="Memory Usage (%)"
              dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="network" 
              stroke="hsl(var(--network))" 
              strokeWidth={2}
              name="Network Traffic (MB/s)"
              dot={{ fill: "hsl(var(--network))", strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="power" 
              stroke="hsl(var(--power))" 
              strokeWidth={2}
              name="Power Consumption (KW)"
              dot={{ fill: "hsl(var(--power))", strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}