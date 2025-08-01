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
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymptom, setSelectedSymptom] = useState<Symptom | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch symptoms from API
  useEffect(() => {
    let isMounted = true;
    
    const fetchSymptoms = async () => {
      try {
        const response = await fetch('http://34.93.204.92:3001/doctors/symptoms');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (isMounted) {
          setSymptoms(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching symptoms:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load symptoms');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSymptoms();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter symptoms based on search term
  const filteredSymptoms = useMemo(() => {
    try {
      const searchLower = (searchTerm || '').toLowerCase().trim();
      
      // If no search term or less than 2 characters, return empty array
      if (searchLower.length < 2) {
        return [];
      }
      
      return symptoms
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
        .sort((a, b) => a.name.localeCompare(b.name));
        
    } catch (err) {
      console.error('Error filtering symptoms:', err);
      return [];
    }
  }, [searchTerm, symptoms]);

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

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Select Symptoms *
        </label>
        <div className="flex items-center justify-center p-8 bg-muted/20 rounded-lg border border-border/30">
          <Loader2 className="h-6 w-6 animate-spin mr-3 text-primary" />
          <span className="text-sm text-muted-foreground">Loading symptoms database...</span>
        </div>
      </div>
    );
  }

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