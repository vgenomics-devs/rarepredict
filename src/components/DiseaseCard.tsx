import { Card, CardContent } from "@/components/ui/card";
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

interface DiseaseCardProps {
  disease: Disease;
  onClick: () => void;
}

export function DiseaseCard({ disease, onClick }: DiseaseCardProps) {
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
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/20 bg-card"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-geist font-semibold text-lg text-card-foreground leading-tight">
            {disease.name}
          </h3>
          <Badge 
            className={cn("ml-3 flex-shrink-0", getConfidenceColor(disease.confidence))}
          >
            {disease.confidence}% {getConfidenceText(disease.confidence)}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground font-jakarta line-clamp-3 mb-4">
          {disease.description}
        </p>
        
        <div className="flex items-center text-xs text-muted-foreground font-jakarta">
          <span className="font-medium">Prevalence:</span>
          <span className="ml-2">{disease.prevalence}</span>
        </div>
      </CardContent>
    </Card>
  );
}