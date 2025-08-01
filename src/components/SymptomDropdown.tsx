import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Loader2, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Symptom } from "./SymptomSelector";

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
  symptoms,
  filteredSymptoms,
  isLoading,
  searchTerm,
  onSearchChange,
  onSymptomSelect,
  onSymptomDetail,
  selectedSymptoms
}: SymptomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ITEMS_PER_PAGE = 20;

  const visibleSymptoms = filteredSymptoms.slice(0, visibleCount);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 50) {
      setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredSymptoms.length));
    }
  };

  const handleSymptomClick = (symptom: Symptom, e: React.MouseEvent) => {
    e.stopPropagation();
    onSymptomSelect(symptom);
    setIsOpen(false);
    onSearchChange("");
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleDetailClick = (symptom: Symptom, e: React.MouseEvent) => {
    e.stopPropagation();
    onSymptomDetail(symptom);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Type to search symptoms..."
          className="w-full pl-10 pr-10 py-3 text-sm border rounded-lg bg-background/50 backdrop-blur-sm border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200"
          value={searchTerm}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setIsOpen(e.target.value.length >= 2);
            setVisibleCount(20);
          }}
          onFocus={() => searchTerm.length >= 2 && setIsOpen(true)}
        />
        <ChevronDown 
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform duration-200 pointer-events-none",
            isOpen && "rotate-180"
          )} 
        />
      </div>

      {isOpen && (
        <Card className="absolute z-50 w-full mt-2 bg-background/95 backdrop-blur-md border border-border/50 shadow-xl animate-fade-in">
          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" />
              <span className="text-sm text-muted-foreground">Loading symptoms...</span>
            </div>
          ) : filteredSymptoms.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-sm text-muted-foreground">
                {searchTerm.length < 2 
                  ? "Type at least 2 characters to search"
                  : "No symptoms found matching your search"
                }
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 border-b border-border/50 bg-muted/30">
                <div className="text-xs font-medium text-muted-foreground">
                  {filteredSymptoms.length} symptom{filteredSymptoms.length !== 1 ? 's' : ''} found
                </div>
              </div>
              <div 
                className="max-h-80 overflow-y-auto"
                onScroll={handleScroll}
              >
                {visibleSymptoms.map((symptom) => {
                  const isSelected = selectedSymptoms.includes(symptom.name);
                  return (
                    <div
                      key={symptom.hpoid}
                      className={cn(
                        "px-4 py-3 hover:bg-muted/50 cursor-pointer flex items-center justify-between group transition-colors duration-150",
                        isSelected && "bg-primary/5 border-l-2 border-l-primary"
                      )}
                      onClick={(e) => handleSymptomClick(symptom, e)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {symptom.name}
                        </div>
                        {symptom.synonyms && symptom.synonyms.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1 truncate">
                            Also known as: {symptom.synonyms.slice(0, 2).join(", ")}
                            {symptom.synonyms.length > 2 && "..."}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        {isSelected && (
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        )}
                        <button 
                          className="p-1.5 rounded-md hover:bg-background/80 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all duration-150"
                          onClick={(e) => handleDetailClick(symptom, e)}
                          title="View details"
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {visibleCount < filteredSymptoms.length && (
                  <div className="p-3 text-center text-xs text-muted-foreground border-t border-border/30">
                    Scroll down to load more results...
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}