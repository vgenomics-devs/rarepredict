import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { TrendingUp, AlertTriangle, CheckCircle, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import type { Disease } from "@/lib/mockApi";
import '@/index.css'


interface DiseaseCardProps {
  disease: Disease;
  index: number;
  selectedSymptoms?: string[];
  predictionId?: string;
}

export function DiseaseCard({
  disease,
  index,
  selectedSymptoms = [],
  predictionId: propPredictionId
}: DiseaseCardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showHpos, setShowHpos] = useState(false);

  // Get prediction ID from props, URL, or generate a new one
  const urlParams = new URLSearchParams(location.search);
  const urlPredictionId = urlParams.get('uuid');
  const predictionId = propPredictionId || urlPredictionId || uuidv4();

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-success text-success-foreground";
    if (confidence >= 60) return "bg-accent text-accent-foreground";
    return "bg-secondary text-secondary-foreground";
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return CheckCircle;
    if (confidence >= 60) return TrendingUp;
    return AlertTriangle;
  };

  const getMatchColor = (percentage: string) => {
    const percent = parseFloat(percentage);
    if (percent >= 80) return 'text-green-500';
    if (percent >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Get matched and total HPO counts
  const hpoDetails = disease.hpoDetails || [];
  const matchedCount = hpoDetails.filter(hpo => hpo.matched).length;
  const totalHpos = hpoDetails.length;

  const matchPercentage = disease.matchPercentage || '0%';
  const matchColor = getMatchColor(matchPercentage);

  const ConfidenceIcon = getConfidenceIcon(disease.confidence);

  const toggleHpos = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowHpos(!showHpos);
  };

  const handleViewDetails = () => {
    // Always use the generated or provided prediction ID
    const finalPredictionId = predictionId || uuidv4();

    navigate(`/disease/${disease.id}?uuid=${finalPredictionId}`, {
      state: {
        disease: {
          ...disease,
          hpoDetails: disease.hpoDetails || [],
          name: disease.name
        },
        selectedSymptoms
      }
    });
  };

  return (
    <Card className="mb-6 overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold">
                {disease.name}
              </CardTitle>
              <Badge
                variant="outline"
                className={cn("ml-2", getConfidenceColor(disease.confidence))}
              >
                <ConfidenceIcon className="h-3 w-3 mr-1" />
                {disease.confidence.toFixed(0)}% Match
              </Badge>
            </div>
            {disease.description && (
              <CardDescription className="line-clamp-2">
                {disease.description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center">
            <span className={`text-sm font-medium ${matchColor} mr-2`}>
              {matchPercentage} Match
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          {/* <div className="text-sm">
            <span className="text-muted-foreground">Matched Symptoms:</span>{' '}
            <span className="font-medium">
              {matchedCount} of {totalHpos}
            </span>
          </div> */}
          <div className="flex gap-2">
            {totalHpos > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-muted-foreground hover:text-foreground"
                onClick={toggleHpos}
              >
                {showHpos ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide HPOs
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show HPOs
                  </>
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-primary hover:bg-white hover:text-black"
              onClick={handleViewDetails}
            >
              View Details
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showHpos && hpoDetails.length > 0 && (
          <div className="mt-2 border rounded-md p-3 bg-muted/10">
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">
              HPO Terms ({matchedCount} of {totalHpos} matched):
            </h4>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {hpoDetails.map((hpo, idx) => (
                <div
                  key={`${hpo.hpo_id}-${idx}`}
                  className={cn(
                    "text-sm p-2 rounded flex items-center",
                    hpo.matched
                      ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                      : "bg-muted/30"
                  )}
                >
                  <span className="font-mono text-xs opacity-70 mr-2">
                    {hpo.hpo_id}
                  </span>
                  <span className="flex-1">
                    {hpo.hpo_name}
                  </span>
                  {hpo.matched && (
                    <CheckCircle className="h-3.5 w-3.5 ml-2 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}