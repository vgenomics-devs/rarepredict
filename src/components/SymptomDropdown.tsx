import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Loader2, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Symptom } from "./SymptomSelector";
import { ErrorBoundary } from "./ErrorBoundary";

interface SymptomDropdownProps {
  symptoms: Symptom[];
  filteredSymptoms: Symptom[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSymptomSelect: (symptom: Symptom) => void;
  onSymptomDetail: (symptom: Symptom) => void;
  selectedSymptoms: string[];
}

export function SymptomDropdown({
  symptoms = [],
  filteredSymptoms = [],
  isLoading = false,
  searchTerm = "",
  onSearchChange = () => {},
  onSymptomSelect = () => {},
  onSymptomDetail = () => {},
  selectedSymptoms = []
}: SymptomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Safe getter for symptoms
  const safeSymptoms = Array.isArray(symptoms) ? symptoms : [];
  const safeFilteredSymptoms = Array.isArray(filteredSymptoms) ? filteredSymptoms : [];
  const safeSearchTerm = typeof searchTerm === 'string' ? searchTerm : '';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      onSearchChange(e.target.value);
      setIsOpen(true);
    } catch (err) {
      console.error('Error in handleInputChange:', err);
    }
  };

  const handleSymptomClick = (symptom: Symptom, e: React.MouseEvent) => {
    try {
      e.stopPropagation();
      onSymptomSelect(symptom);
      setIsOpen(false);
      onSearchChange("");
    } catch (err) {
      console.error('Error in handleSymptomClick:', err);
    }
  };

  return (
    <ErrorBoundary>
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type to search symptoms..."
            className="w-full pl-10 pr-10 py-3 text-sm border rounded-lg bg-background/50 backdrop-blur-sm border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200"
            value={safeSearchTerm}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
          />
          <ChevronDown 
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform duration-200 pointer-events-none",
              isOpen && "rotate-180"
            )} 
          />
        </div>

        {isOpen && (
          <Card className="absolute z-50 w-full mt-2 bg-background/95 backdrop-blur-md border border-border/50 shadow-xl">
            {isLoading ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" />
                <span className="text-sm text-muted-foreground">Loading symptoms...</span>
              </div>
            ) : safeFilteredSymptoms.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-sm text-muted-foreground">
                  {!safeSearchTerm || safeSearchTerm.length < 2 
                    ? "Start typing to search symptoms..."
                    : "No symptoms found matching your search"
                  }
                </div>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {safeFilteredSymptoms.map((symptom) => {
                  if (!symptom || !symptom.name) return null;
                  
                  const isSelected = selectedSymptoms.includes(symptom.name);
                  return (
                    <div
                      key={symptom.hpoid || symptom.name}
                      className={cn(
                        "px-4 py-3 hover:bg-muted/50 cursor-pointer flex items-center justify-between",
                        isSelected && "bg-primary/5 border-l-2 border-l-primary"
                      )}
                      onClick={(e) => handleSymptomClick(symptom, e)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {symptom.name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}
      </div>
    </ErrorBoundary>
  );
}