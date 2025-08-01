import { useState, useEffect, useMemo } from "react";
import { Check, ChevronDown, Loader2, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Symptom {
  symptomguid: string;
  name: string;
  hpoid: string;
  definition?: string;
  synonyms?: string[];
  xrefs?: string[];
  // Add other fields from API if needed
}

interface SymptomSelectorProps {
  selectedSymptoms: string[];
  onSymptomsChange: (symptoms: string[]) => void;
}

export function SymptomSelector({ selectedSymptoms, onSymptomsChange }: SymptomSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);
  const [selectedSymptom, setSelectedSymptom] = useState<Symptom | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const response = await fetch('http://34.93.204.92:3001/doctors/symptoms');
        if (!response.ok) {
          throw new Error('Failed to fetch symptoms');
        }
        const data = await response.json();
        setSymptoms(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching symptoms:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSymptoms();
  }, []);

  const filteredSymptoms = useMemo(() => {
    if (searchTerm.length < 3) return symptoms;
    
    const searchLower = searchTerm.toLowerCase();
    
    try {
      return symptoms.filter(symptom => {
        // Only search in name and synonyms
        const nameMatch = symptom.name?.toLowerCase().includes(searchLower) || false;
        const synonymsMatch = symptom.synonyms?.some(
          synonym => synonym?.toLowerCase().includes(searchLower)
        ) || false;
        
        return nameMatch || synonymsMatch;
      });
    } catch (error) {
      console.error('Error filtering symptoms:', error);
      return [];
    }
  }, [searchTerm, symptoms]);

  const visibleSymptoms = filteredSymptoms.slice(0, visibleCount);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      // Reached bottom, load more
      setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredSymptoms.length));
    }
  };

  const toggleSymptom = (symptom: Symptom) => {
    if (selectedSymptoms.includes(symptom.name)) {
      onSymptomsChange(selectedSymptoms.filter(s => s !== symptom.name));
    } else {
      onSymptomsChange([...selectedSymptoms, symptom.name]);
    }
  };

  const handleSymptomClick = (symptom: Symptom) => {
    setSelectedSymptom(symptom);
    setIsDetailOpen(true);
  };

  const removeSymptom = (e: React.MouseEvent, symptomName: string) => {
    e.stopPropagation();
    onSymptomsChange(selectedSymptoms.filter(s => s !== symptomName));
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-jakarta font-medium text-foreground">
        Select Symptoms *
      </label>

      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span>Loading symptoms...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 border rounded">
          Error loading symptoms: {error}
        </div>
      ) : (
        <>
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search symptoms..."
              className="w-full px-3 py-2 text-sm border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setSearchTerm(e.target.value);
                if (e.target.value) {
                  setIsOpen(true);
                }
              }}
              onFocus={() => inputValue && setIsOpen(true)}
            />
            <ChevronDown 
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform pointer-events-none",
                isOpen && "rotate-180"
              )} 
            />
          </div>

          {/* Selected symptoms - Moved below search */}
          <div className="mt-3">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Selected Symptoms: {selectedSymptoms.length}
            </div>
            {selectedSymptoms.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-md min-h-[60px]">
                {selectedSymptoms.map((symptomName) => {
                  const symptom = symptoms.find(s => s.name === symptomName);
                  return (
                    <div key={symptomName} className="flex items-center gap-1">
                      <Badge
                        variant="secondary"
                        className="px-2 py-1 bg-accent text-accent-foreground hover:bg-accent/80 cursor-pointer"
                      >
                        <span>{symptomName}</span>
                        <button 
                          className="ml-1.5 text-muted-foreground hover:text-foreground"
                          onClick={() => symptom && handleSymptomClick(symptom)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                          </svg>
                        </button>
                        <button 
                          className="ml-0.5 text-muted-foreground hover:text-foreground"
                          onClick={(e) => removeSymptom(e, symptomName)}
                        >
                          ×
                        </button>
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-md min-h-[60px] flex items-center">
                No symptoms selected yet. Search and select symptoms above.
              </div>
            )}
          </div>

          {/* Dropdown content */}
          {isOpen && filteredSymptoms.length > 0 && (
            <Card className="absolute z-50 w-full max-w-md bg-background border shadow-lg mt-1">
              <div 
                className="max-h-60 overflow-y-auto"
                onScroll={handleScroll}
              >
                {filteredSymptoms.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    No matching symptoms found
                  </div>
                ) : (
                  <div className="divide-y">
                    {visibleSymptoms.map((symptom) => (
                      <div
                        key={symptom.hpoid}
                        className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center justify-between"
                        onClick={() => {
                          toggleSymptom(symptom);
                          setInputValue("");
                          setSearchTerm("");
                          setIsOpen(false);
                        }}
                      >
                        <span className="text-sm">{symptom.name}</span>
                        <button 
                          className="text-muted-foreground hover:text-foreground p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSymptomClick(symptom);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            <line x1="11" y1="8" x2="11" y2="14"></line>
                            <line x1="8" y1="11" x2="14" y2="11"></line>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Symptom Detail Modal */}
      {isDetailOpen && selectedSymptom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsDetailOpen(false)}>
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedSymptom.name}</h2>
                  <div className="text-sm text-muted-foreground mb-4">HPO: {selectedSymptom.hpoid}</div>
                </div>
                <button 
                  onClick={() => setIsDetailOpen(false)}
                  className="p-1 rounded-full hover:bg-accent"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {selectedSymptom.definition && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Definition</h3>
                  <p className="text-sm text-muted-foreground">{selectedSymptom.definition}</p>
                </div>
              )}

              {selectedSymptom.synonyms && selectedSymptom.synonyms.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Synonyms</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptom.synonyms.map((synonym, index) => (
                      <span key={index} className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded">
                        {synonym}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedSymptom.xrefs && selectedSymptom.xrefs.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">References</h3>
                  <div className="space-y-2">
                    {selectedSymptom.xrefs.map((xref, index) => (
                      <div key={index} className="flex items-center text-sm text-muted-foreground">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        <a 
                          href={`https://hpo.jax.org/app/browse/term/${selectedSymptom.hpoid}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View in HPO Browser
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (!selectedSymptoms.includes(selectedSymptom.name)) {
                      toggleSymptom(selectedSymptom);
                    }
                    setIsDetailOpen(false);
                  }}
                >
                  {selectedSymptoms.includes(selectedSymptom.name) ? 'Selected' : 'Add to List'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}