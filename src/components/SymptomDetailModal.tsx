import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { X, ExternalLink, Plus, Check } from "lucide-react";
import { Symptom } from "./SymptomSelector";

interface SymptomDetailModalProps {
  symptom: Symptom | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleSymptom: (symptom: Symptom) => void;
  isSelected: boolean;
}

export function SymptomDetailModal({
  symptom,
  isOpen,
  onClose,
  onToggleSymptom,
  isSelected
}: SymptomDetailModalProps) {
  if (!isOpen || !symptom) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" 
      onClick={onClose}
    >
      <Card 
        className="bg-background/95 backdrop-blur-md border border-border/50 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header */}
          <div className="flex justify-between items-start p-6 border-b border-border/30 bg-gradient-to-r from-muted/20 to-transparent">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-foreground mb-2 break-words">{symptom.name}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  HPO: {symptom.hpoid}
                </Badge>
                {isSelected && (
                  <Badge variant="default" className="text-xs bg-primary/10 text-primary border-primary/20">
                    <Check className="h-3 w-3 mr-1" />
                    Selected
                  </Badge>
                )}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="shrink-0 ml-4 hover:bg-background/80"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {symptom.definition && (
              <div>
                <h3 className="font-semibold mb-3 text-foreground">Definition</h3>
                <p className="text-sm text-muted-foreground leading-relaxed bg-muted/20 p-4 rounded-lg border border-border/20">
                  {symptom.definition}
                </p>
              </div>
            )}

            {symptom.synonyms && symptom.synonyms.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-foreground">
                  Alternative Names ({symptom.synonyms.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {symptom.synonyms.map((synonym, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs bg-accent/50 text-accent-foreground hover:bg-accent/70 transition-colors"
                    >
                      {synonym}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {symptom.xrefs && symptom.xrefs.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-foreground">External References</h3>
                <div className="space-y-2">
                  <a 
                    href={`https://hpo.jax.org/app/browse/term/${symptom.hpoid}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 p-3 rounded-lg border border-primary/20"
                  >
                    <ExternalLink className="h-4 w-4 mr-2 shrink-0" />
                    <span>View in HPO Browser</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border/30 bg-gradient-to-r from-transparent to-muted/20">
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="hover:bg-background/80"
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  onToggleSymptom(symptom);
                  onClose();
                }}
                className={isSelected ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"}
              >
                {isSelected ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Remove from List
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add to List
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}