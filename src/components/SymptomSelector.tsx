import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { NewSymptomDropdown as SymptomDropdown } from "./NewSymptomDropdown";
import { SelectedSymptoms } from "./SelectedSymptoms";
import { SymptomDetailModal } from "./SymptomDetailModal";
import { ErrorBoundary } from "./ErrorBoundary";
import { FreeTextSymptomInput } from "./FreeTextSymptomInput";

declare global {
  interface Window {
    allSymptoms: Symptom[];
  }
}

export interface Symptom {
  symptomguid: string;
  name: string;
  hpoid: string;
  definition?: string;
  synonyms?: string[];
  xrefs?: string[];
}

// Shape returned by the /doctors/symptoms API
interface ApiSymptom {
  id?: string;
  name?: string;
  hpoid?: string;
  definition?: string;
  synonyms?: string[];
  xrefs?: string[];
}

interface SymptomSelectorProps {
  selectedSymptoms: Array<{ id: string; name: string }>;
  onSymptomsChange: (symptoms: Array<{ id: string; name: string }>) => void;
}

export function SymptomSelector({ selectedSymptoms = [], onSymptomsChange }: SymptomSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [filteredSymptoms, setFilteredSymptoms] = useState<Symptom[]>([]);
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

  // Load all symptoms on component mount
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const loadSymptoms = async () => {
      if (!isMounted) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch symptoms from the API
        const response = await fetch('http://34.93.204.92:3001/doctors/symptoms', {
          signal: abortController.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const apiSymptoms = await response.json() as ApiSymptom[];

        // Transform API response to match our Symptom interface
        const formattedSymptoms: Symptom[] = apiSymptoms.map((symptom: ApiSymptom) => ({
          symptomguid: symptom.id || `symptom-${Math.random().toString(36).substr(2, 9)}`,
          name: symptom.name || 'Unnamed Symptom',
          hpoid: symptom.hpoid || '',
          definition: symptom.definition || '',
          synonyms: Array.isArray(symptom.synonyms) ? symptom.synonyms : [],
          xrefs: Array.isArray(symptom.xrefs) ? symptom.xrefs : []
        }));

        if (isMounted) {
          setSymptoms(formattedSymptoms);
          setFilteredSymptoms(formattedSymptoms.slice(0, 10)); // Show first 10 by default

          // Make the symptoms available globally for HPO ID extraction
          window.allSymptoms = formattedSymptoms;

          // Save to localStorage for persistence
          try {
            localStorage.setItem('allSymptoms', JSON.stringify(formattedSymptoms));
          } catch (e) {
            console.error('Failed to save symptoms to localStorage:', e);
          }

        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load symptoms. Please try again later.');
          console.error('Error loading symptoms:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSymptoms();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  // Filter symptoms based on search term
  useEffect(() => {
    const searchLower = debouncedSearchTerm.toLowerCase().trim();


    // If search term is too short, show first 10 symptoms
    if (searchLower.length < 2) {
      setFilteredSymptoms(symptoms.slice(0, 10));
      setIsSearching(false);
      return;
    }

    // Show loading state while filtering
    setIsSearching(true);

    // Use setTimeout to avoid blocking the UI during filtering
    const timer = setTimeout(() => {
      try {
        const filtered = symptoms
          .filter(symptom => {
            if (!symptom?.name) return false;

            // Check name (case-insensitive)
            const nameMatch = symptom.name.toLowerCase().includes(searchLower);
            if (nameMatch) return true;

            // Check synonyms if they exist and are in the correct format
            if (Array.isArray(symptom.synonyms)) {
              return symptom.synonyms.some(synonym =>
                typeof synonym === 'string' && synonym.toLowerCase().includes(searchLower)
              );
            }
            return false;
          })
          .sort((a, b) => {
            // Prioritize exact matches at start of name
            const aStarts = a.name.toLowerCase().startsWith(searchLower);
            const bStarts = b.name.toLowerCase().startsWith(searchLower);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;

            // Then by length of match (shorter names first)
            return a.name.length - b.name.length;
          });



        setFilteredSymptoms(filtered);
      } catch (error) {
        console.error('Error filtering symptoms:', error);
      } finally {
        setIsSearching(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [debouncedSearchTerm, symptoms]);

  // Handle symptom selection
  const handleSymptomSelect = (symptom: Symptom) => {
    if (!symptom?.name || !symptom?.hpoid) return;

    const symptomObj = { id: symptom.hpoid, name: symptom.name };
    const isSelected = selectedSymptoms.some(s => s.id === symptom.hpoid);

    const newSymptoms = isSelected
      ? selectedSymptoms.filter(s => s.id !== symptom.hpoid)
      : [...selectedSymptoms, symptomObj];

    onSymptomsChange(newSymptoms);
  };

  // Handle removing a symptom
  const handleSymptomRemove = (symptomId: string) => {
    onSymptomsChange(selectedSymptoms.filter(s => s.id !== symptomId));
  };

  // Clear all selected symptoms
  const handleClearAll = () => {
    onSymptomsChange([]);
  };

  // Handle showing symptom details
  const handleSymptomDetail = (symptomId: string) => {
    const symptom = symptoms.find(s => s.hpoid === symptomId || s.name === symptomId);
    if (symptom) {
      setSelectedSymptom(symptom);
      setIsDetailOpen(true);
    }
  };

  // Toggle symptom selection (for use with SymptomDetailModal)
  const toggleSymptom = (symptom: Symptom) => {
    if (!symptom?.name || !symptom?.hpoid) return;

    const symptomObj = { id: symptom.hpoid, name: symptom.name };
    const isSelected = selectedSymptoms.some(s => s.id === symptom.hpoid);
    const newSelected = isSelected
      ? selectedSymptoms.filter(s => s.id !== symptom.hpoid)
      : [...selectedSymptoms, symptomObj];

    onSymptomsChange(newSelected);
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

      <div className="space-y-4">
        <ErrorBoundary fallback={<div className="text-sm text-destructive">Error loading symptom selector</div>}>
          <div className="relative">
            <SymptomDropdown
              symptoms={symptoms}
              filteredSymptoms={filteredSymptoms}
              isLoading={isLoading}
              isSearching={isSearching && debouncedSearchTerm.length >= 2}
              searchTerm={searchTerm}
              onSearchChange={(value) => {
                setSearchTerm(value);
                if (value.trim().length >= 2) {
                  setIsSearching(true);
                }
              }}
              onSymptomSelect={handleSymptomSelect}
              selectedSymptoms={selectedSymptoms}
            />

            <FreeTextSymptomInput
              onAddSymptom={(symptoms) => {
                try {
                  // Handle both single symptom and array of symptoms
                  const newSymptoms = (Array.isArray(symptoms) ? symptoms : [symptoms])
                    .filter(Boolean)
                    .map(symptom => {
                      // Handle case where symptom is a string (for backward compatibility)
                      if (typeof symptom === 'string') {
                        return {
                          id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                          name: symptom
                        };
                      }
                      // Handle case where symptom is an object with id and name
                      return {
                        id: symptom.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        name: symptom.name || 'Unnamed Symptom'
                      };
                    });

                  // Only add symptoms that aren't already in the selectedSymptoms
                  const uniqueNewSymptoms = newSymptoms.filter(s =>
                    s && !selectedSymptoms.some(existing => existing.id === s.id)
                  );

                  if (uniqueNewSymptoms.length > 0) {
                    onSymptomsChange([...selectedSymptoms, ...uniqueNewSymptoms]);
                  }
                } catch (err) {
                  console.error('Error adding symptoms:', err);
                }
              }}
              existingSymptoms={selectedSymptoms}
            />
          </div>

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
              isSelected={selectedSymptoms.some(s => s.id === selectedSymptom.hpoid)}
            />
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}