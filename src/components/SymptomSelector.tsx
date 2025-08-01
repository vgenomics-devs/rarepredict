import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { SymptomDropdown } from "./SymptomDropdown";
import { SelectedSymptoms } from "./SelectedSymptoms";
import { SymptomDetailModal } from "./SymptomDetailModal";

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

export function SymptomSelector({ selectedSymptoms, onSymptomsChange }: SymptomSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymptom, setSelectedSymptom] = useState<Symptom | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
    if (searchTerm.length < 2) return [];
    
    const searchLower = searchTerm.toLowerCase().trim();
    
    try {
      return symptoms.filter(symptom => {
        const nameMatch = symptom.name?.toLowerCase().includes(searchLower) || false;
        const synonymsMatch = symptom.synonyms?.some(
          synonym => synonym?.toLowerCase().includes(searchLower)
        ) || false;
        
        return nameMatch || synonymsMatch;
      }).sort((a, b) => {
        // Prioritize exact matches at the beginning
        const aExact = a.name?.toLowerCase().startsWith(searchLower) ? 1 : 0;
        const bExact = b.name?.toLowerCase().startsWith(searchLower) ? 1 : 0;
        return bExact - aExact;
      });
    } catch (error) {
      console.error('Error filtering symptoms:', error);
      return [];
    }
  }, [searchTerm, symptoms]);

  const toggleSymptom = (symptom: Symptom) => {
    if (selectedSymptoms.includes(symptom.name)) {
      onSymptomsChange(selectedSymptoms.filter(s => s !== symptom.name));
    } else {
      onSymptomsChange([...selectedSymptoms, symptom.name]);
    }
  };

  const handleSymptomDetail = (symptom: Symptom) => {
    setSelectedSymptom(symptom);
    setIsDetailOpen(true);
  };

  const handleSymptomRemove = (symptomName: string) => {
    onSymptomsChange(selectedSymptoms.filter(s => s !== symptomName));
  };

  const handleClearAll = () => {
    onSymptomsChange([]);
  };

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
    <div className="space-y-4">
      <label className="text-sm font-medium text-foreground">
        Select Symptoms *
      </label>

      <SymptomDropdown
        symptoms={symptoms}
        filteredSymptoms={filteredSymptoms}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSymptomSelect={toggleSymptom}
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

      <SymptomDetailModal
        symptom={selectedSymptom}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onToggleSymptom={toggleSymptom}
        isSelected={selectedSymptom ? selectedSymptoms.includes(selectedSymptom.name) : false}
      />
    </div>
  );
}