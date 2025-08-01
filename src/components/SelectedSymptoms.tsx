import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, X, Trash2 } from "lucide-react";
import { Symptom } from "./SymptomSelector";

interface SelectedSymptomsProps {
  selectedSymptoms: string[];
  symptoms: Symptom[];
  onSymptomRemove: (symptomName: string) => void;
  onSymptomDetail: (symptom: Symptom) => void;
  onClearAll: () => void;
}

export function SelectedSymptoms({
  selectedSymptoms,
  symptoms,
  onSymptomRemove,
  onSymptomDetail,
  onClearAll
}: SelectedSymptomsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-foreground">
          Selected Symptoms ({selectedSymptoms.length})
        </div>
        {selectedSymptoms.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>
      
      {selectedSymptoms.length > 0 ? (
        <div className="grid gap-2 p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-border/30 min-h-[100px]">
          {selectedSymptoms.map((symptomName) => {
            const symptom = symptoms.find(s => s.name === symptomName);
            return (
              <div 
                key={symptomName} 
                className="flex items-center gap-2 group animate-fade-in"
              >
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-background/60 backdrop-blur-sm border border-border/40 hover:bg-background/80 transition-all duration-200 max-w-full"
                >
                  <span className="truncate font-medium text-sm">{symptomName}</span>
                  <div className="flex items-center gap-1 ml-auto">
                    {symptom && (
                      <button 
                        className="text-muted-foreground hover:text-primary transition-colors p-0.5 rounded"
                        onClick={() => onSymptomDetail(symptom)}
                        title="View details"
                      >
                        <Info className="h-3 w-3" />
                      </button>
                    )}
                    <button 
                      className="text-muted-foreground hover:text-destructive transition-colors p-0.5 rounded"
                      onClick={() => onSymptomRemove(symptomName)}
                      title="Remove symptom"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </Badge>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground p-6 bg-muted/20 rounded-lg border-2 border-dashed border-border/30 text-center min-h-[100px] flex items-center justify-center">
          <div>
            <div className="mb-2">No symptoms selected yet</div>
            <div className="text-xs text-muted-foreground/70">
              Search and select symptoms from the dropdown above
            </div>
          </div>
        </div>
      )}
    </div>
  );
}