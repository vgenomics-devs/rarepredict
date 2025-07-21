import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SYMPTOMS = [
  "Fever", "Headache", "Fatigue", "Muscle pain", "Joint pain", "Nausea", 
  "Vomiting", "Diarrhea", "Constipation", "Abdominal pain", "Chest pain",
  "Shortness of breath", "Cough", "Sore throat", "Runny nose", "Congestion",
  "Dizziness", "Confusion", "Memory loss", "Vision problems", "Hearing loss",
  "Skin rash", "Skin discoloration", "Hair loss", "Nail changes", "Weight loss",
  "Weight gain", "Appetite loss", "Difficulty swallowing", "Numbness", "Tingling",
  "Weakness", "Tremor", "Seizures", "Sleep problems", "Anxiety", "Depression"
];

interface SymptomSelectorProps {
  selectedSymptoms: string[];
  onSymptomsChange: (symptoms: string[]) => void;
}

export function SymptomSelector({ selectedSymptoms, onSymptomsChange }: SymptomSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSymptoms = SYMPTOMS.filter(symptom =>
    symptom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      onSymptomsChange(selectedSymptoms.filter(s => s !== symptom));
    } else {
      onSymptomsChange([...selectedSymptoms, symptom]);
    }
  };

  const removeSymptom = (symptom: string) => {
    onSymptomsChange(selectedSymptoms.filter(s => s !== symptom));
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-jakarta font-medium text-foreground">
        Select Symptoms *
      </label>
      
      {/* Selected symptoms */}
      {selectedSymptoms.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSymptoms.map((symptom) => (
            <Badge
              key={symptom}
              variant="secondary"
              className="px-3 py-1 bg-accent text-accent-foreground hover:bg-accent/80 cursor-pointer"
              onClick={() => removeSymptom(symptom)}
            >
              {symptom} ×
            </Badge>
          ))}
        </div>
      )}

      {/* Dropdown trigger */}
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between font-jakarta text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedSymptoms.length > 0 ? "text-foreground" : "text-muted-foreground"}>
          {selectedSymptoms.length > 0 
            ? `${selectedSymptoms.length} symptom${selectedSymptoms.length > 1 ? 's' : ''} selected`
            : "Choose symptoms..."
          }
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {/* Dropdown content */}
      {isOpen && (
        <Card className="absolute z-50 w-full max-w-md bg-background border shadow-lg">
          <div className="p-3">
            <input
              type="text"
              placeholder="Search symptoms..."
              className="w-full px-3 py-2 text-sm border rounded-md bg-input focus:outline-none focus:ring-2 focus:ring-ring"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredSymptoms.map((symptom) => (
              <div
                key={symptom}
                className="flex items-center gap-3 px-3 py-2 hover:bg-muted cursor-pointer"
                onClick={() => toggleSymptom(symptom)}
              >
                <div className="flex items-center justify-center w-4 h-4">
                  {selectedSymptoms.includes(symptom) && (
                    <Check className="h-3 w-3 text-primary" />
                  )}
                </div>
                <span className="text-sm font-jakarta text-foreground">{symptom}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}