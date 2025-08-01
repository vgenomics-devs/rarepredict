import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { SymptomDropdown } from "./SymptomDropdown";
import { SelectedSymptoms } from "./SelectedSymptoms";
import { SymptomDetailModal } from "./SymptomDetailModal";
import { ErrorBoundary } from "./ErrorBoundary";

export interface Symptom {
  symptomguid: string;
  name: string;
  hpoid: string;
  definition?: string;
  synonyms?: string[];
  xrefs?: string[];
}

interface SymptomSelectorProps {
  selectedSymptoms: string[];
  onSymptomsChange: (symptoms: string[]) => void;
}

export function SymptomSelector({ selectedSymptoms = [], onSymptomsChange }: SymptomSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymptom, setSelectedSymptom] = useState<Symptom | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search symptoms via API with debounced search term
  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();
    
    const searchSymptoms = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setSymptoms([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        // Try server-side search first, fallback to client-side if not available
        const searchUrl = `http://34.93.204.92:3001/doctors/symptoms/search?q=${encodeURIComponent(debouncedSearchTerm)}`;
        const fallbackUrl = 'http://34.93.204.92:3001/doctors/symptoms';
        
        let response;
        try {
          response = await fetch(searchUrl, { signal: abortController.signal });
        } catch {
          // Fallback to full dataset if search endpoint doesn't exist
          response = await fetch(fallbackUrl, { signal: abortController.signal });
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (isMounted) {
          let filteredData = Array.isArray(data) ? data : [];
          
          // If we got full dataset, filter client-side (but limit results)
          if (response.url.includes('symptoms') && !response.url.includes('search')) {
            const searchLower = debouncedSearchTerm.toLowerCase().trim();
            filteredData = filteredData
              .filter(symptom => {
                if (!symptom?.name) return false;
                
                // Check name
                if (symptom.name.toLowerCase().includes(searchLower)) return true;
                
                // Check synonyms
                return Array.isArray(symptom.synonyms) && 
                  symptom.synonyms.some(synonym => 
                    typeof synonym === 'string' && 
                    synonym.toLowerCase().includes(searchLower)
                  );
              })
              .slice(0, 50) // Limit to 50 results for performance
              .sort((a, b) => {
                // Prioritize exact matches
                const aExact = a.name.toLowerCase().startsWith(searchLower);
                const bExact = b.name.toLowerCase().startsWith(searchLower);
                if (aExact && !bExact) return -1;
                if (!aExact && bExact) return 1;
                return a.name.localeCompare(b.name);
              });
          }
          
          setSymptoms(filteredData);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error searching symptoms:', err);
          if (isMounted) {
            setError(err instanceof Error ? err.message : 'Failed to search symptoms');
          }
        }
      } finally {
        if (isMounted) {
          setIsSearching(false);
        }
      }
    };

    searchSymptoms();
    
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [debouncedSearchTerm]);

  // Memoize filtered symptoms for dropdown
  const filteredSymptoms = useMemo(() => {
    return symptoms;
  }, [symptoms]);

  // Handle symptom selection
  const handleSymptomSelect = (symptom: Symptom) => {
    try {
      if (!symptom?.name) return;
      
      const isSelected = selectedSymptoms.includes(symptom.name);
      const newSelected = isSelected
        ? selectedSymptoms.filter(s => s !== symptom.name)
        : [...selectedSymptoms, symptom.name];
      
      onSymptomsChange(newSelected);
    } catch (err) {
      console.error('Error selecting symptom:', err);
    }
  };

  // Handle removing a symptom
  const handleSymptomRemove = (symptomName: string) => {
    try {
      onSymptomsChange(selectedSymptoms.filter(s => s !== symptomName));
    } catch (err) {
      console.error('Error removing symptom:', err);
    }
  };

  // Clear all selected symptoms
  const handleClearAll = () => {
    try {
      onSymptomsChange([]);
    } catch (err) {
      console.error('Error clearing symptoms:', err);
    }
  };

  // Handle showing symptom details
  const handleSymptomDetail = (symptom: Symptom) => {
    try {
      setSelectedSymptom(symptom);
      setIsDetailOpen(true);
    } catch (err) {
      console.error('Error showing symptom details:', err);
    }
  };

  // Toggle symptom selection (for use with SymptomDetailModal)
  const toggleSymptom = (symptom: Symptom) => {
    try {
      if (!symptom?.name) return;
      
      const isSelected = selectedSymptoms.includes(symptom.name);
      const newSelected = isSelected
        ? selectedSymptoms.filter(s => s !== symptom.name)
        : [...selectedSymptoms, symptom.name];
      
      onSymptomsChange(newSelected);
    } catch (err) {
      console.error('Error toggling symptom:', err);
    }
  };


  // Error state
  if (error) {
    return (
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Select Symptoms *
        </label>
        <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
          <div className="text-sm text-destructive">
            Error loading symptoms: {error}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Please refresh the page to try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Select Symptoms * 
      </label>
      
      <ErrorBoundary>
        <SymptomDropdown
          symptoms={symptoms}
          filteredSymptoms={filteredSymptoms}
          isLoading={isLoading}
          isSearching={isSearching}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSymptomSelect={handleSymptomSelect}
          onSymptomDetail={handleSymptomDetail}
          selectedSymptoms={selectedSymptoms}
        />
        
        <SelectedSymptoms 
          selectedSymptoms={selectedSymptoms} 
          symptoms={symptoms}
          onSymptomRemove={handleSymptomRemove}
          onSymptomDetail={handleSymptomDetail}
          onClearAll={handleClearAll}
        />
        
        {selectedSymptom && (
          <SymptomDetailModal
            symptom={selectedSymptom}
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            onToggleSymptom={toggleSymptom}
            isSelected={selectedSymptoms.includes(selectedSymptom.name)}
          />
        )}
      </ErrorBoundary>
    </div>
  );
}