import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ForecastCalendarProps {
  data: any[];
  onDateSelect: (date: string) => void;
  selectedDate?: string;
  className?: string;
}

export function ForecastCalendar({ data, onDateSelect, selectedDate, className }: ForecastCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const { calendarData, monthStats } = useMemo(() => {
    if (!data || data.length === 0) return { calendarData: {}, monthStats: {} };
    
    // Group data by date
    const dateGroups: { [key: string]: any[] } = {};
    data.forEach(row => {
      const date = row.dates || row.date;
      if (!date) return;
      if (!dateGroups[date]) dateGroups[date] = [];
      dateGroups[date].push(row);
    });
    
    // Calculate monthly aggregated stats
    const monthlyStats: { [key: string]: any } = {};
    
    Object.entries(dateGroups).forEach(([date, rows]) => {
      const dateObj = new Date(date);
      const monthKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}`;
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          totalInputs: 0,
          avgCpu: 0,
          avgMemory: 0,
          avgNetwork: 0,
          avgPower: 0,
          days: 0
        };
      }
      
      const dayStats = monthlyStats[monthKey];
      dayStats.totalInputs += rows.length;
      dayStats.avgCpu += rows.reduce((sum, row) => sum + (parseFloat(row.cpu_usage) || 0), 0) / rows.length;
      dayStats.avgMemory += rows.reduce((sum, row) => sum + (parseFloat(row.memory_usage) || 0), 0) / rows.length;
      dayStats.avgNetwork += rows.reduce((sum, row) => sum + (parseFloat(row.network_traffic) || 0), 0) / rows.length;
      dayStats.avgPower += rows.reduce((sum, row) => sum + (parseFloat(row.power_consumption) || 0), 0) / rows.length;
      dayStats.days += 1;
    });
    
    // Average the monthly stats
    Object.keys(monthlyStats).forEach(monthKey => {
      const stats = monthlyStats[monthKey];
      stats.avgCpu = Math.round(stats.avgCpu / stats.days * 100) / 100;
      stats.avgMemory = Math.round(stats.avgMemory / stats.days * 100) / 100;
      stats.avgNetwork = Math.round(stats.avgNetwork / stats.days / 1000000 * 100) / 100; // MB/s
      stats.avgPower = Math.round(stats.avgPower / stats.days / 1000 * 100) / 100; // KW
    });
    
    return { calendarData: dateGroups, monthStats: monthlyStats };
  }, [data]);

  const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
  const currentMonthStats = monthStats[currentMonthKey];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getIntensityClass = (inputCount: number) => {
    if (inputCount === 0) return "";
    if (inputCount < 200) return "bg-primary/20";
    if (inputCount < 500) return "bg-primary/40";
    if (inputCount < 800) return "bg-primary/60";
    return "bg-primary/80";
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <Card className={cn("p-6 bg-gradient-card border-card-border shadow-card", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Forecast Calendar</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm font-medium text-foreground min-w-[120px] text-center">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Monthly Stats */}
      {currentMonthStats && (
        <div className="mb-6 p-4 rounded-lg bg-muted/10 border border-card-border">
          <h4 className="text-sm font-medium text-foreground mb-2">Monthly Forecasted Averages</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">CPU Usage:</span>
              <span className="ml-1 font-medium text-primary">{currentMonthStats.avgCpu}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Memory:</span>
              <span className="ml-1 font-medium text-accent">{currentMonthStats.avgMemory}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Network:</span>
              <span className="ml-1 font-medium text-network">{currentMonthStats.avgNetwork} MB/s</span>
            </div>
            <div>
              <span className="text-muted-foreground">Power:</span>
              <span className="ml-1 font-medium text-power">{currentMonthStats.avgPower} KW</span>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="space-y-2">
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty days */}
          {emptyDays.map(day => (
            <div key={`empty-${day}`} className="p-2 h-10" />
          ))}
          
          {/* Month days */}
          {days.map(day => {
            const dateKey = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayData = calendarData[dateKey] || [];
            const inputCount = dayData.length;
            const isSelected = selectedDate === dateKey;
            
            return (
              <button
                key={day}
                onClick={() => onDateSelect(dateKey)}
                className={cn(
                  "p-2 h-10 text-xs rounded-md border transition-all duration-200 hover:scale-105",
                  "flex items-center justify-center font-medium",
                  isSelected && "ring-2 ring-primary border-primary",
                  inputCount > 0 ? getIntensityClass(inputCount) : "border-card-border hover:border-primary/50",
                  inputCount > 0 ? "text-foreground" : "text-muted-foreground"
                )}
                title={inputCount > 0 ? `${inputCount} predicted inputs` : 'No data'}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-card-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Activity Level:</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-primary/20" />
              <span>Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-primary/40" />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-primary/60" />
              <span>High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-primary/80" />
              <span>Peak</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}