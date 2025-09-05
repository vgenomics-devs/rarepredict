import { Loader2, CheckCircle, AlertCircle, Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PredictionItem } from "@/components/PredictionItem";
import type { Disease } from "@/lib/mockApi";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import '@/index.css'

interface ResultsSectionProps {
  predictions: Disease[];
  isLoading: boolean;
  show?: boolean;
  predictionId: string;
  onClear: () => void;
  onBack?: () => void;
  className?: string;
}

export function ResultsSection({
  predictions,
  isLoading,
  show = true,
  predictionId,
  onClear,
  onBack,
  className,
}: ResultsSectionProps) {
  if (!show) return null;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Default behavior if onBack is not provided
      window.scrollTo({ top: 0, behavior: 'smooth' });
      onClear();
    }
  };

  return (
    <div className={cn(className, "w-full flex flex-col h-full")} id="results">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col h-full"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-1 hover:bg-white hover:text-black"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Symptoms
              </Button>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#DFDAE4] rounded-full border border-success/20">
                <CheckCircle className="h-4 w-4 text-black" />
                <span className="text-sm font-medium text-black">Analysis Complete</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              Clear All
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            {/* <Info className="h-4 w-4 flex-shrink-0" /> */}
            {/* <span>Results are sorted by probability</span> */}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full py-12 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Analyzing symptoms...</p>
              </div>
            ) : predictions.length > 0 ? (
              <div className="space-y-2">
                {predictions.map((disease, index) => (
                  <motion.div
                    key={`${disease.id}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + (index * 0.05) }}
                  >
                    <PredictionItem
                      disease={disease}
                      index={index}
                      predictionId={predictionId}
                    />
                  </motion.div>
                ))}

                <div className="mt-6 p-4 bg-muted/20 rounded-lg border border-border/50 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Important Note</p>
                      <p className="mt-1">
                        These results are for informational purposes only and should not be considered a medical diagnosis.
                        Please consult with a healthcare professional for medical advice.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg border border-border/50 h-full flex flex-col items-center justify-center">
                <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium text-foreground mb-1">No predictions found</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  We couldn't find any matching rare diseases. Try adjusting your symptoms or adding more details.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClear}
                >
                  Clear and try again
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
