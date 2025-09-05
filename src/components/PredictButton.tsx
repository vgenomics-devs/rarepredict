import { Button } from "./ui/button";
import { Activity, Sparkles, Brain, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

type PredictButtonProps = {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
};

export function PredictButton({
  onClick,
  isLoading = false,
  disabled = false,
  className = "",
}: PredictButtonProps) {
  return (
    <div className="relative group w-full max-w-md mx-auto">
      {/* Glow effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r from-accent to-primary rounded-full opacity-0 group-hover:opacity-70 blur transition-all duration-300 ${
        disabled ? 'opacity-0' : ''
      }`}></div>
      
      <Button
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`relative overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl ${className} ${
          disabled 
            ? 'opacity-100 cursor-not-allowed bg-gradient-to-r from-muted/80 to-muted/60 border border-muted-foreground/20' 
            : 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 hover:shadow-accent/30 transform hover:-translate-y-0.5 active:translate-y-0'
        } w-full h-16 rounded-full`} // Made button taller and full rounded for oval shape
        size="lg"
      >
        {/* Rotating background elements */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          <div className="absolute w-[150%] h-[300%] bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-full" />
        </motion.div>
        
        {/* Inner rotating element */}
        <motion.div 
          className="absolute inset-2 rounded-full border-2 border-white/20"
          animate={{ 
            rotate: -360,
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "linear",
            scale: {
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-1 w-full h-full">
          {isLoading ? (
            <>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <Activity className="h-5 w-5" />
              </motion.div>
              <span className="font-semibold text-foreground/90">Analyzing...</span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
                <motion.span
                  initial={{ x: 0 }}
                  animate={{ x: [0, 5, 0] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  <Sparkles className="h-5 w-5 text-yellow-200" />
                </motion.span>
                <span className="font-semibold text-white text-lg">Predict Rare Diseases</span>
                <motion.span
                  initial={{ x: 0 }}
                  animate={{ x: [0, -5, 0] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 0.3
                  }}
                >
                  <ArrowRight className="h-5 w-5 text-white/80 group-hover:translate-x-1 transition-transform" />
                </motion.span>
              </div>
              <motion.div 
                className={`text-xs mt-1 ${
                  disabled ? 'text-foreground/60' : 'text-white/70'
                }`}
                initial={{ opacity: 0.7 }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                {disabled ? 'Add symptoms to analyze' : 'Click to analyze symptoms'}
              </motion.div>
            </>
          )}
        </div>
      </Button>
    </div>
  );
}
