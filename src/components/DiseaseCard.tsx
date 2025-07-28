import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, AlertTriangle, CheckCircle, Info } from "lucide-react";

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
  index: number;
}

export function DiseaseCard({ disease, onClick, index }: DiseaseCardProps) {
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

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return CheckCircle;
    if (confidence >= 60) return TrendingUp;
    return AlertTriangle;
  };

  const ConfidenceIcon = getConfidenceIcon(disease.confidence);

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-accent/10 hover:border-accent/30 hover:-translate-y-1 bg-card backdrop-blur-sm",
        "animate-fade-in"
      )}
      style={{ animationDelay: `${index * 150}ms` }}
      onClick={onClick}
    >
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1">
            <h3 className="font-jakarta font-bold text-lg text-card-foreground leading-tight group-hover:text-accent transition-colors">
              {disease.name}
            </h3>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Info className="h-3 w-3" />
              <span className="text-xs font-jakarta font-medium">Rare Disease</span>
            </div>
          </div>
          
          <Badge 
            className={cn(
              "flex items-center gap-1.5 font-medium transition-all duration-200",
              getConfidenceColor(disease.confidence)
            )}
          >
            <ConfidenceIcon className="h-3 w-3" />
            {disease.confidence}%
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground font-jakarta leading-relaxed line-clamp-3">
          {disease.description}
        </p>
        
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-jakarta">
            <span className="font-medium">Prevalence:</span>
            <span>{disease.prevalence}</span>
          </div>
          
          <div className="flex items-center gap-1 text-xs font-jakarta font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
            <span>View Details</span>
            <TrendingUp className="h-3 w-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}