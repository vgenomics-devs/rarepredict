import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import type { Disease } from "@/lib/mockApi";

interface PredictionItemProps {
  disease: Disease;
  index: number;
  predictionId?: string;
}

export function PredictionItem({ disease, index, predictionId: propPredictionId }: PredictionItemProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showHpos, setShowHpos] = useState(false);

  const urlParams = new URLSearchParams(location.search);
  const urlPredictionId = urlParams.get('uuid');
  const predictionId = propPredictionId || urlPredictionId || uuidv4();

  const getRdxColor = (score?: number) => {
    if (typeof score !== 'number' || isNaN(score)) return "bg-secondary text-secondary-foreground";
    if (score >= 0.8) return "bg-success text-success-foreground";
    if (score >= 0.5) return "bg-accent text-accent-foreground";
    return "bg-muted text-foreground";
  };

  const hpoDetails = disease.hpoDetails || [];
  const matchedCount = hpoDetails.filter(hpo => hpo.matched).length;
  const totalHpos = hpoDetails.length;
  const rdxScore = typeof disease.rdxScore === 'number' && !isNaN(disease.rdxScore)
    ? disease.rdxScore
    : undefined;
  const matchedPercent = totalHpos > 0 ? Math.round((matchedCount / totalHpos) * 100) : 0;
  const unmatchedCount = totalHpos - matchedCount;
  const matchedList = hpoDetails.filter(h => h.matched);
  const unmatchedList = hpoDetails.filter(h => !h.matched);
  const normalizeHpoId = (id: string) => {
    if (!id) return id;
    const t = id.trim().toUpperCase();
    return t.startsWith('HP:') ? t : `HP:${t.replace(/^HP/, '')}`;
  };

  const toggleHpos = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowHpos(!showHpos);
  };

  const handleViewDetails = () => {
    const finalPredictionId = predictionId;
    navigate(`/disease/${disease.id}?uuid=${finalPredictionId}`, {
      state: {
        disease: {
          ...disease,
          hpoDetails: disease.hpoDetails || [],
          name: disease.name
        }
      }
    });
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg font-semibold">
                {index + 1}. {disease.name}
              </CardTitle>
              {/* <Badge
                variant="outline"
                className={cn("ml-1", getRdxColor(rdxScore))}
              >
                RDX Score: {rdxScore !== undefined ? rdxScore.toFixed(2) : 'N/A'}
              </Badge> */}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {totalHpos > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-muted-foreground hover:text-foreground hover:bg-white hover:text-black"
                onClick={toggleHpos}
              >
                {showHpos ? (
                  <>
                    <ChevronUp className="h-4 w-4 " />
                    Hide Symptoms
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show Symptoms
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
      </CardHeader>

      <CardContent className="space-y-3">
        {/* <div className="text-sm">
          <span className="text-muted-foreground">Matched Symptoms:</span>{' '}
          <span className="font-medium">{matchedCount} of {totalHpos}</span>
        </div> */}

        {showHpos && hpoDetails.length > 0 && (
          <div className="mt-2 border rounded-md p-3 bg-muted/10">
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Matched vs Unmatched</span>
                <span className="font-medium text-foreground">{matchedCount} matched · {unmatchedCount} unmatched</span>
              </div>
              <TooltipProvider>
                <div className="w-full h-2.5 rounded-md overflow-hidden bg-muted/40 flex">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="h-full bg-green-500/80 hover:bg-green-500 transition-colors"
                        style={{ width: `${matchedPercent}%` }}
                        aria-label={`Matched ${matchedCount}`}
                        title=""
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs">
                        <div className="font-medium mb-1">Matched ({matchedCount})</div>
                        <ul className="list-disc pl-4 space-y-0.5 max-w-xs max-h-40 overflow-auto">
                          {matchedList.slice(0, 8).map((h, i) => (
                            <li key={`m-${i}`}>
                              {h.hpo_name} <span className="opacity-60">(
                                <a
                                  href={`https://hpo.jax.org/app/browse/term/${normalizeHpoId(h.hpo_id)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline-offset-2 hover:underline"
                                >
                                  {h.hpo_id}
                                </a>
                                )</span>
                            </li>
                          ))}
                          {matchedList.length > 8 && (
                            <li className="opacity-70">+{matchedList.length - 8} more…</li>
                          )}
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="h-full bg-red-500/70 hover:bg-red-500 transition-colors flex-1"
                        style={{ width: `${100 - matchedPercent}%` }}
                        aria-label={`Unmatched ${unmatchedCount}`}
                        title=""
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs">
                        <div className="font-medium mb-1">Unmatched ({unmatchedCount})</div>
                        <ul className="list-disc pl-4 space-y-0.5 max-w-xs max-h-40 overflow-auto">
                          {unmatchedList.slice(0, 8).map((h, i) => (
                            <li key={`u-${i}`}>
                              {h.hpo_name} <span className="opacity-60">(
                                <a
                                  href={`https://hpo.jax.org/app/browse/term/${normalizeHpoId(h.hpo_id)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline-offset-2 hover:underline"
                                >
                                  {h.hpo_id}
                                </a>
                                )</span>
                            </li>
                          ))}
                          {unmatchedList.length > 8 && (
                            <li className="opacity-70">+{unmatchedList.length - 8} more…</li>
                          )}
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
