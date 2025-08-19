import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Database, Calendar, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MaintenanceAlert {
  id: string;
  type: "vacuum" | "backup" | "index" | "maintenance";
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  scheduledDate: string;
  estimatedDuration: string;
  status: "pending" | "scheduled" | "completed";
}

interface MaintenanceAlertsProps {
  data: any[];
  className?: string;
}

export function MaintenanceAlerts({ data, className }: MaintenanceAlertsProps) {
  const alerts = useMemo((): MaintenanceAlert[] => {
    if (!data || data.length === 0) return [];
    
    const alerts: MaintenanceAlert[] = [];
    
    // Group data by date to analyze patterns
    const dateGroups: { [key: string]: any[] } = {};
    data.forEach(row => {
      const date = row.dates || row.date;
      if (!date) return;
      if (!dateGroups[date]) dateGroups[date] = [];
      dateGroups[date].push(row);
    });
    
    const dates = Object.keys(dateGroups).sort();
    
    // Predict vacuum needs based on input frequency
    dates.forEach((date, index) => {
      const dayData = dateGroups[date];
      const inputCount = dayData.length;
      
      // High input days (>800 inputs) need vacuum within 3 days
      if (inputCount > 800) {
        const futureDate = new Date(date);
        futureDate.setDate(futureDate.getDate() + 3);
        
        alerts.push({
          id: `vacuum-${date}`,
          type: "vacuum",
          title: "Database Vacuum Required",
          description: `VACUUM operation needed to reclaim storage space and update statistics`,
          severity: "medium",
          scheduledDate: futureDate.toLocaleDateString(),
          estimatedDuration: "2-4 hours",
          status: "pending"
        });
      }
      
      // Weekly backup schedule
      if (index % 7 === 0) {
        const backupDate = new Date(date);
        backupDate.setDate(backupDate.getDate() + 7);
        
        alerts.push({
          id: `backup-${date}`,
          type: "backup",
          title: "Scheduled Backup",
          description: "Weekly full database backup",
          severity: "medium",
          scheduledDate: backupDate.toLocaleDateString(),
          estimatedDuration: "1-3 hours",
          status: "scheduled"
        });
      }
      
      // Index maintenance for high CPU usage days
      const avgCpu = dayData.reduce((sum, row) => sum + (parseFloat(row.cpu_usage) || 0), 0) / dayData.length;
      if (avgCpu > 70) {
        const indexDate = new Date(date);
        indexDate.setDate(indexDate.getDate() + 1);
        
        alerts.push({
          id: `index-${date}`,
          type: "index",
          title: "Index Optimization",
          description: "High CPU usage detected - index rebuilding recommended",
          severity: "high",
          scheduledDate: indexDate.toLocaleDateString(),
          estimatedDuration: "30-60 minutes",
          status: "pending"
        });
      }
    });
    
    // Sort by date and limit to next 10 alerts
    return alerts
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
      .slice(0, 10);
  }, [data]);

  const getIcon = (type: string) => {
    switch (type) {
      case "vacuum":
        return <Database className="h-4 w-4" />;
      case "backup":
        return <CheckCircle className="h-4 w-4" />;
      case "index":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "scheduled":
        return "warning";
      case "pending":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <Card className={cn("p-6 bg-gradient-card border-card-border shadow-card", className)}>
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="h-5 w-5 text-warning" />
        <h3 className="text-lg font-semibold text-foreground">Maintenance Schedule & Alerts</h3>
      </div>
      
      {alerts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No maintenance alerts generated yet.</p>
          <p className="text-sm">Upload CSV data to see predictions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start justify-between p-4 rounded-lg border border-card-border bg-muted/5 hover:bg-muted/10 transition-colors"
            >
              <div className="flex gap-3 flex-1">
                <div className={cn(
                  "p-2 rounded-lg",
                  alert.severity === "high" ? "bg-destructive/10 text-destructive" :
                  alert.severity === "medium" ? "bg-warning/10 text-warning" :
                  "bg-secondary/10 text-secondary-foreground"
                )}>
                  {getIcon(alert.type)}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{alert.title}</h4>
                    <Badge variant={getSeverityColor(alert.severity) as any} className="text-xs">
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {alert.scheduledDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {alert.estimatedDuration}
                    </div>
                    <Badge variant={getStatusColor(alert.status) as any} className="text-xs">
                      {alert.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Button size="sm" variant="outline" className="ml-4">
                Schedule
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}