import { useState, KeyboardEvent } from "react";
import { PlusCircle, Search, Loader2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useToast } from "./ui/use-toast";
import { v4 as uuidv4 } from 'uuid';


interface HPOTerm {
  id: string;
  name: string;
}

export interface FreeTextSymptomInputProps {
  onAddSymptom: (symptom: { id: string; name: string } | { id: string; name: string }[]) => void;
  existingSymptoms: Array<{ id: string; name: string }>;
}

export function FreeTextSymptomInput({ onAddSymptom, existingSymptoms }: FreeTextSymptomInputProps) {
  const [customSymptom, setCustomSymptom] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isMapping, setIsMapping] = useState(false);
  const { toast } = useToast();

  const mapTextToHPO = async () => {
    const query = customSymptom.trim();
    if (!query) {
      setError("Please enter symptoms to map");
      return;
    }

    try {
      setIsMapping(true);
      setError(null);

      const response = await fetch('http://34.93.204.92:5000/map-hpo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: query, uuid: uuidv4() })
      });

      if (!response.ok) throw new Error('Failed to map symptoms to HPO terms');

      const data = await response.json();
      const terms = data.hpo_terms || [];

      if (terms.length === 0) {
        setError("No matching HPO terms found");
        return;
      }

      // Pass the HPO terms with both ID and name
      onAddSymptom(terms);

      // Clear the input and show success message
      setCustomSymptom('');
      toast({
        title: "Symptoms Added",
        description: `Added ${terms.length} symptom${terms.length > 1 ? 's' : ''} to your selection`,
      });
    } catch (err) {
      console.error('Error mapping symptoms:', err);
      setError('Failed to map symptoms. Please try again.');
    } finally {
      setIsMapping(false);
    }
  };

  const handleAddSymptom = (symptomInput: string) => {
    const trimmedSymptom = symptomInput.trim();
    if (!trimmedSymptom) {
      setError("Please enter a symptom");
      return;
    }

    if (existingSymptoms.some(s => s.name === trimmedSymptom)) {
      setError("This symptom has already been added");
      return;
    }

    // Create a temporary ID for manual entries (these will be replaced by real HPO IDs if mapped)
    onAddSymptom({
      id: `temp-${Date.now()}`,
      name: trimmedSymptom
    });
    setCustomSymptom("");
    setError(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customSymptom.trim()) {
      e.preventDefault();
      mapTextToHPO();
    }
  };

  return (
    <div className="mt-4 border-t border-border/30 pt-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={customSymptom}
                onChange={(e) => {
                  setCustomSymptom(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Describe symptoms in your own words..."
                className="pl-10 pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-primary"
                onClick={() => customSymptom.trim() && handleAddSymptom(customSymptom)}
                disabled={!customSymptom.trim()}
              >
                <PlusCircle className="h-4 w-4 text-black" />
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={mapTextToHPO}
              disabled={!customSymptom.trim() || isMapping}
              className="whitespace-nowrap"
            >
              {isMapping ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mapping...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4 text-[#F59E0B]" />
                  Map to Symptoms
                </>
              )}
            </Button>
          </div>


        </div>
      </div>

      {error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}

      <p className="mt-2 text-xs text-muted-foreground">
        Type symptoms and click "Map to Symptoms" to find matching standardized terms
      </p>
    </div>
  );
}
