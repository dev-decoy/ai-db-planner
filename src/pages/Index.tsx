import { useState } from "react";
import { Upload, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  const [csvData, setCsvData] = useState<any[]>([]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
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
            
            <div className="text-right text-sm text-muted-foreground">
              <div className="flex items-center gap-2 mb-1">
                <Database className="h-4 w-4" />
                <span>Ready to analyze your data</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {csvData.length === 0 ? (
          /* Upload Section */
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="p-4 rounded-full bg-muted text-muted-foreground">
                  <Upload className="h-8 w-8" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Upload Your Database CSV File
                </h3>
                <p className="text-sm text-muted-foreground">
                  Drag and drop your CSV file here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Expected format: dates column + cpu_usage, memory_usage, network_traffic, power_consumption
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  Choose CSV File
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Dashboard Loaded!</h2>
            <p className="text-muted-foreground">CSV data processed successfully</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;