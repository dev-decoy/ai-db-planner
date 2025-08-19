import { useState, useMemo } from "react";
import { Upload, Database, Cpu, MemoryStick, Network, Zap } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { CSVUpload } from "@/components/CSVUpload";
import { ResourceChart } from "@/components/ResourceChart";
import { InputFrequencyChart } from "@/components/InputFrequencyChart";
import { MaintenanceAlerts } from "@/components/MaintenanceAlerts";
import { ForecastCalendar } from "@/components/ForecastCalendar";

const Index = () => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  const metrics = useMemo(() => {
    if (!csvData || csvData.length === 0) {
      return {
        totalRecords: 0,
        dailyInputs: 0,
        avgCpu: 0,
        avgMemory: 0,
        avgNetwork: 0,
        avgPower: 0,
        dateRange: { start: "", end: "" }
      };
    }

    // Group data by date to calculate daily inputs
    const dateGroups: { [key: string]: any[] } = {};
    csvData.forEach(row => {
      const date = row.dates || row.date;
      if (!date) return;
      if (!dateGroups[date]) dateGroups[date] = [];
      dateGroups[date].push(row);
    });

    const dates = Object.keys(dateGroups).sort();
    const dailyInputs = Math.round(csvData.length / dates.length);
    
    // Calculate averages across all data
    const avgCpu = csvData.reduce((sum, row) => sum + (parseFloat(row.cpu_usage) || 0), 0) / csvData.length;
    const avgMemory = csvData.reduce((sum, row) => sum + (parseFloat(row.memory_usage) || 0), 0) / csvData.length;
    const avgNetwork = csvData.reduce((sum, row) => sum + (parseFloat(row.network_traffic) || 0), 0) / csvData.length;
    const avgPower = csvData.reduce((sum, row) => sum + (parseFloat(row.power_consumption) || 0), 0) / csvData.length;

    return {
      totalRecords: csvData.length,
      dailyInputs,
      avgCpu: Math.round(avgCpu * 100) / 100,
      avgMemory: Math.round(avgMemory * 100) / 100,
      avgNetwork: Math.round(avgNetwork / 1000000 * 100) / 100, // Convert to MB/s
      avgPower: Math.round(avgPower / 1000 * 100) / 100, // Convert to KW
      dateRange: {
        start: dates[0] || "",
        end: dates[dates.length - 1] || ""
      }
    };
  }, [csvData]);

  const selectedDateData = useMemo(() => {
    if (!selectedDate || !csvData.length) return [];
    return csvData.filter(row => (row.dates || row.date) === selectedDate);
  }, [csvData, selectedDate]);

  const handleDataLoaded = (data: any[], name: string) => {
    setCsvData(data);
    setFileName(name);
    
    // Auto-select first date if available
    const firstDate = data.find(row => row.dates || row.date)?.[row.dates ? 'dates' : 'date'];
    if (firstDate) {
      setSelectedDate(firstDate);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-card-border bg-gradient-card">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Database Capacity Planning
              </h1>
              <p className="text-muted-foreground">
                AI-powered predictions and maintenance scheduling
              </p>
            </div>
            
            {csvData.length > 0 && (
              <div className="text-right text-sm text-muted-foreground">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="h-4 w-4" />
                  <span>{metrics.totalRecords.toLocaleString()} records processed</span>
                </div>
                {fileName && (
                  <div className="text-xs opacity-75">
                    Source: {fileName}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {csvData.length === 0 ? (
          /* Upload Section */
          <div className="max-w-2xl mx-auto">
            <CSVUpload onDataLoaded={handleDataLoaded} />
          </div>
        ) : (
          <>
            {/* Metrics Overview */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Daily Inputs"
                value={metrics.dailyInputs}
                unit="avg/day"
                subtitle={`from ${metrics.dateRange.start || 'N/A'} to ${metrics.dateRange.end || 'N/A'}`}
                icon={<Upload className="h-4 w-4" />}
                trend={{ value: 5.2, label: "from last period" }}
              />
              
              <MetricCard
                title="CPU Usage"
                value={metrics.avgCpu}
                unit="%"
                icon={<Cpu className="h-4 w-4" />}
                variant={metrics.avgCpu > 70 ? "warning" : metrics.avgCpu > 90 ? "destructive" : "default"}
              />
              
              <MetricCard
                title="Memory Usage"
                value={metrics.avgMemory}
                unit="%"
                icon={<MemoryStick className="h-4 w-4" />}
                variant={metrics.avgMemory > 70 ? "warning" : metrics.avgMemory > 90 ? "destructive" : "default"}
              />
              
              <MetricCard
                title="Network Traffic"
                value={metrics.avgNetwork}
                unit="MB/s"
                icon={<Network className="h-4 w-4" />}
              />
              
              <MetricCard
                title="Power Consumption"
                value={metrics.avgPower}
                unit="KW"
                icon={<Zap className="h-4 w-4" />}
              />
            </section>

            {/* Calendar and Charts */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <ForecastCalendar
                  data={csvData}
                  onDateSelect={setSelectedDate}
                  selectedDate={selectedDate}
                />
              </div>
              
              <div className="lg:col-span-2">
                <InputFrequencyChart
                  data={csvData}
                  title="Daily Input Frequency"
                  height={400}
                />
              </div>
            </section>

            {/* Resource Charts */}
            <section>
              <ResourceChart
                data={csvData}
                title="System Resource Utilization"
                height={500}
              />
            </section>

            {/* Maintenance Alerts */}
            <section>
              <MaintenanceAlerts data={csvData} />
            </section>

            {/* Selected Date Details */}
            {selectedDate && selectedDateData.length > 0 && (
              <section className="bg-gradient-card border border-card-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Predictions for {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Expected inputs:</p>
                    <p className="text-2xl font-bold text-primary">~{selectedDateData.length}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">CPU estimate:</p>
                    <p className="text-2xl font-bold text-primary">
                      {Math.round(selectedDateData.reduce((sum, row) => sum + (parseFloat(row.cpu_usage) || 0), 0) / selectedDateData.length * 100) / 100}%
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Memory estimate:</p>
                    <p className="text-2xl font-bold text-primary">
                      {Math.round(selectedDateData.reduce((sum, row) => sum + (parseFloat(row.memory_usage) || 0), 0) / selectedDateData.length * 100) / 100}%
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Data Management Actions */}
            <section className="flex justify-center">
              <CSVUpload onDataLoaded={handleDataLoaded} className="max-w-md" />
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;