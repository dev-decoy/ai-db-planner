import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Papa from "papaparse";

interface CSVUploadProps {
  onDataLoaded: (data: any[], fileName: string) => void;
  className?: string;
}

export function CSVUpload({ onDataLoaded, className }: CSVUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    setIsLoading(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`CSV parsing error: ${results.errors[0].message}`);
          setIsLoading(false);
          return;
        }
        
        setUploadedFile(file.name);
        onDataLoaded(results.data, file.name);
        setIsLoading(false);
      },
      error: (error) => {
        setError(`Failed to parse CSV: ${error.message}`);
        setIsLoading(false);
      }
    });
  }, [onDataLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    
    if (!csvFile) {
      setError("Please upload a valid CSV file");
      return;
    }
    
    processFile(csvFile);
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    processFile(file);
  }, [processFile]);

  const clearFile = () => {
    setUploadedFile(null);
    setError(null);
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300",
      isDragOver && "border-primary/50 bg-primary/5",
      error && "border-destructive/50",
      uploadedFile && "border-success/50",
      className
    )}>
      <div
        className="p-8 text-center space-y-4"
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        {uploadedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">File Uploaded Successfully</h3>
              <p className="text-sm text-muted-foreground mt-1">{uploadedFile}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFile}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Upload Different File
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center">
              <div className={cn(
                "p-4 rounded-full transition-colors",
                isDragOver ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {isLoading ? (
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                ) : (
                  <Upload className="h-8 w-8" />
                )}
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
              <Button
                variant="default"
                className="gap-2 bg-gradient-primary hover:opacity-90"
                onClick={() => document.getElementById('csv-upload')?.click()}
                disabled={isLoading}
              >
                <FileText className="h-4 w-4" />
                Choose CSV File
              </Button>
              
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          </>
        )}
        
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}
      </div>
    </Card>
  );
}