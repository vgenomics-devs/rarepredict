import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Loader2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface Symptom {
  symptomguid: string;
  name: string;
  hpoid: string;
  definition?: string;
  synonyms?: string[];
  xrefs?: string[];
}

interface NewSymptomDropdownProps {
  symptoms: Symptom[];
  filteredSymptoms: Symptom[];
  isLoading: boolean;
  isSearching?: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSymptomSelect: (symptom: Symptom) => void;
  selectedSymptoms: Array<{id: string; name: string}>;
}

export function NewSymptomDropdown({
  symptoms = [],
  filteredSymptoms = [],
  isLoading = false,
  isSearching = false,
  searchTerm = "",
  onSearchChange = () => {},
  onSymptomSelect = () => {},
  selectedSymptoms = []
}: NewSymptomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle dropdown visibility when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto-focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleSymptomClick = (symptom: Symptom) => {
    onSymptomSelect(symptom);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleClearSearch = () => {
    onSearchChange('');
    inputRef.current?.focus();
  };

  // Show default symptoms when search term is too short
  const displaySymptoms = searchTerm.length >= 2 
    ? filteredSymptoms 
    : symptoms.length > 0 
      ? symptoms.slice(0, 10) 
      : [];

  return (
    <div className="w-full space-y-1" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search symptoms..."
          className="w-full pl-10 pr-10 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onClick={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsOpen(false);
          }}
        />
        {searchTerm && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-auto border shadow-lg">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
              <p>Loading symptoms...</p>
            </div>
          ) : isSearching ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
              <p>Searching...</p>
            </div>
          ) : displaySymptoms.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchTerm.length < 3 
                ? symptoms.length === 0 
                  ? "No symptoms available"
                  : "Type at least 3 characters to search"
                : "No symptoms found"
              }
            </div>
          ) : (
            <div className="divide-y">
              {displaySymptoms.map((symptom) => (
                <div
                  key={`${symptom.hpoid}-${symptom.name}`}
                  className={cn(
                    "px-4 py-2 hover:bg-muted/50 cursor-pointer",
                    selectedSymptoms.some(s => s.id === symptom.hpoid) && "bg-primary/5"
                  )}
                  onClick={() => handleSymptomClick(symptom)}
                >
                  <div className="font-medium">{symptom.name}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
