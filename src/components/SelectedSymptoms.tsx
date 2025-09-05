import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, X, Trash2 } from "lucide-react";
import { Symptom } from "./SymptomSelector";

interface SelectedSymptomsProps {
  selectedSymptoms: Array<{ id: string; name: string }>;
  symptoms: Symptom[];
  onSymptomRemove: (symptomId: string) => void;
  onSymptomDetail: (symptomId: string) => void;
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
        <div className="p-3 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-border/30 min-h-[72px] max-h-40 overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {selectedSymptoms.map((symptom) => {
              // Find the full symptom details including HPO ID and other metadata
              const fullSymptom = symptoms.find(s =>
                s.hpoid === symptom.id ||
                s.name.toLowerCase() === symptom.name.toLowerCase() ||
                s.symptomguid === symptom.id
              );

              // Use the name from the full symptom if available, otherwise use the provided name
              const displayName = fullSymptom ? fullSymptom.name : symptom.name;

              return (
                <div key={symptom.id} className="group">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1.5 px-2.5 py-1 h-7 bg-background/60 backdrop-blur-sm border border-border/40 hover:bg-background/80 transition-colors duration-150 max-w-full shadow-sm"
                  >
                    <span className="truncate">{displayName}</span>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // If we have the full symptom with HPO ID, use that, otherwise use the symptom ID
                          if (fullSymptom && 'hpoid' in fullSymptom && fullSymptom.hpoid) {
                            onSymptomDetail(fullSymptom.hpoid);
                          } else {
                            onSymptomDetail(symptom.id);
                          }
                        }}
                        className="opacity-70 hover:opacity-100 hover:bg-muted rounded-full p-0.5 transition-opacity hover:bg-white hover:text-black"
                        aria-label="View details"
                      >
                        <Info className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSymptomRemove(symptom.id);
                        }}
                        className="opacity-70 hover:opacity-100 hover:bg-muted rounded-full p-0.5 transition-opacity"
                        aria-label="Remove symptom"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground p-6 bg-muted/20 rounded-lg border-2 border-dashed border-border/30 text-center min-h-[72px] flex items-center justify-center">
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