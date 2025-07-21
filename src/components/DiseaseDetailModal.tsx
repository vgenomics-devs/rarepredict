import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Disease {
  id: string;
  name: string;
  confidence: number;
  description: string;
  symptoms: string[];
  prevalence: string;
  links: { title: string; url: string; }[];
}

interface DiseaseDetailModalProps {
  disease: Disease | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DiseaseDetailModal({ disease, isOpen, onClose }: DiseaseDetailModalProps) {
  if (!isOpen || !disease) return null;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-success text-success-foreground";
    if (confidence >= 60) return "bg-accent text-accent-foreground";
    return "bg-secondary text-secondary-foreground";
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 80) return "High";
    if (confidence >= 60) return "Medium";
    return "Low";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-background shadow-2xl mx-4">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="font-geist text-xl text-foreground pr-4">
                {disease.name}
              </CardTitle>
              <Badge 
                className={cn("mt-2 inline-flex", getConfidenceColor(disease.confidence))}
              >
                {disease.confidence}% Confidence - {getConfidenceText(disease.confidence)} Match
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-geist font-semibold text-foreground mb-3">Description</h3>
            <p className="text-muted-foreground font-jakarta leading-relaxed">
              {disease.description}
            </p>
          </div>

          {/* Symptoms */}
          <div>
            <h3 className="font-geist font-semibold text-foreground mb-3">Common Symptoms</h3>
            <div className="flex flex-wrap gap-2">
              {disease.symptoms.map((symptom, index) => (
                <Badge key={index} variant="outline" className="font-jakarta">
                  {symptom}
                </Badge>
              ))}
            </div>
          </div>

          {/* Prevalence */}
          <div>
            <h3 className="font-geist font-semibold text-foreground mb-3">Prevalence</h3>
            <p className="text-muted-foreground font-jakarta">
              {disease.prevalence}
            </p>
          </div>

          {/* External Links */}
          <div>
            <h3 className="font-geist font-semibold text-foreground mb-3">Learn More</h3>
            <div className="space-y-2">
              {disease.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-jakarta text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  {link.title}
                </a>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-muted/50 p-4 rounded-lg border">
            <p className="text-xs text-muted-foreground font-jakarta">
              <strong>Medical Disclaimer:</strong> This tool provides general information only and should not replace professional medical advice. 
              Always consult with qualified healthcare professionals for accurate diagnosis and treatment recommendations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}