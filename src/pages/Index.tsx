import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Activity, Loader2, Stethoscope, Shield, Users, TrendingUp, CheckCircle, Brain, Search, Info, Home, Sparkles, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PointerHighlight } from "@/components/ui/pointer-highlight";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import medicalHero from '@/assets/medical-hero.jpg';
import medicalHeroMobile from '@/assets/without_rarepredict.png';
import medicalHeroWithLogo from '@/assets/with_rarepredict.png';
import medicalIconsBg from '@/assets/medical-icons-bg.jpg';
import { Compare } from "@/components/ui/compare";
import { SymptomSelector } from "@/components/SymptomSelector";
import { PredictButton } from "@/components/PredictButton";
// import { DiseaseCard } from "@/components/DiseaseCard";
import { ResultsSection } from "@/components/ResultsSection";
import { predictRareDiseases, type Disease } from "@/lib/mockApi";
import { useToast } from "@/hooks/use-toast";
import { HeroSection } from "@/components/HeroSection";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer"
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Carousel } from "@/components/ui/carousel";

interface StoredPredictionData {
  predictions: Disease[];
  selectedSymptoms: Array<{ id: string; name: string }>;
  age?: string; // legacy field, can be removed after migration
  ageYears?: number;
  ageMonths?: number;
  ageDisplay?: string; // for display purposes only
  timestamp: number;
}

const BLOCKED_KEYS = new Set(['e', 'E', '+', '-', '.']);
function clamp(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function sanitizePaste(raw: string) {
  return raw.replace(/\D+/g, '');
}
function CompareDemo() {
  return (
    <div className="p-4 border rounded-3xl dark:bg-neutral-900 bg-neutral-100 border-neutral-200 dark:border-neutral-800 px-4">
      <Compare
        firstImage="https://assets.aceternity.com/code-problem.png"
        secondImage="https://assets.aceternity.com/code-solution.png"
        firstImageClassName="object-cover object-left-top"
        secondImageClassname="object-cover object-left-top"
        className="h-[250px] w-[200px] md:h-[500px] md:w-[500px]"
        slideMode="hover"
      />
    </div>
  );
}

const Index = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Array<{ id: string; name: string }>>([]);
  const [ageYears, setAgeYears] = useState<number>(0);
  const [ageMonths, setAgeMonths] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<Disease[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [predictionId, setPredictionId] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<'age' | 'symptoms' | 'results'>('age');
  const [formErrors, setFormErrors] = useState<{ age?: string; symptoms?: string }>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { predictionId: urlPredictionId } = useParams<{ predictionId?: string }>();
  const location = useLocation();

  // Check if we're loading a specific prediction from the URL
  useEffect(() => {
    if (urlPredictionId) {
      // If we have a prediction ID in the URL, try to load it
      const savedData = localStorage.getItem('rareDiseasePredictionData');
      if (savedData) {
        const data = JSON.parse(savedData) as StoredPredictionData;
        if (data.predictions && data.predictions.length > 0) {
          setPredictions(data.predictions);
          setSelectedSymptoms(data.selectedSymptoms || []);
          setAgeYears(data.ageYears || 0);
          setAgeMonths(data.ageMonths || 0);
          setShowResults(true);
          setCurrentStep('results');

          // Scroll to results if needed (e.g., coming from disease details)
          if ((location as any).state?.scrollToResults) {
            setTimeout(() => {
              const resultsElement = document.getElementById('results-section');
              if (resultsElement) {
                resultsElement.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
          }
        }
      }
    }
  }, [urlPredictionId, location.state]);

  useEffect(() => {
    const loadSavedData = () => {
      // Skip loading saved data if we're loading a specific prediction from URL
      if (urlPredictionId) return;

      try {
        const savedData = localStorage.getItem('rareDiseasePredictionData');
        if (savedData) {
          const { predictions, selectedSymptoms, age, ageYears, ageMonths, timestamp } = JSON.parse(savedData) as StoredPredictionData;

          const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
          if (Date.now() - timestamp < oneDay) {
            setPredictions(predictions);
            setSelectedSymptoms(selectedSymptoms || []);
            if (typeof ageYears === 'number' || typeof ageMonths === 'number') {
              setAgeYears(Math.max(0, Math.floor(ageYears || 0)));
              setAgeMonths(Math.min(11, Math.max(0, Math.floor(ageMonths || 0))));
            } else if (age) {
              // legacy: try to parse numeric string years
              const y = parseInt(age);
              setAgeYears(Number.isFinite(y) ? Math.max(0, Math.floor(y)) : 0);
              setAgeMonths(0);
            } else {
              setAgeYears(0);
              setAgeMonths(0);
            }
            setShowResults(predictions.length > 0);
            localStorage.removeItem('rareDiseasePredictionData');

            // If we have predictions, update the URL with the prediction ID
            if (predictions.length > 0) {
              const url = new URL(window.location.href);
              if (!url.searchParams.has('uuid')) {
                const newPredictionId = uuidv4();
                setPredictionId(newPredictionId);
                navigate(`/predictions/${newPredictionId}`, { replace: true });
              }
            }
          } else {
            localStorage.removeItem('rareDiseasePredictionData');
          }
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
        localStorage.removeItem('rareDiseasePredictionData');
      }
    };

    loadSavedData();
  }, [navigate, urlPredictionId]);

  useEffect(() => {
    if (predictions.length > 0 || selectedSymptoms.length > 0 || ageYears > 0 || ageMonths > 0) {
      const dataToStore: StoredPredictionData = {
        predictions,
        selectedSymptoms,
        ageYears,
        ageMonths,
        ageDisplay: `${Math.max(0, Math.floor(ageYears))}y ${Math.min(11, Math.max(0, Math.floor(ageMonths)))}m`,
        timestamp: Date.now()
      };
      localStorage.setItem('rareDiseasePredictionData', JSON.stringify(dataToStore));
    } else {
      localStorage.removeItem('rareDiseasePredictionData');
    }
  }, [predictions, selectedSymptoms, ageYears, ageMonths]);

  // ========= NEW: Auto-analyze when 3+ symptoms are selected =========

  // ==================================================================

  const validateAge = (): boolean => {
    const years = Math.max(0, Math.floor(Number.isFinite(ageYears) ? ageYears : 0));
    const months = Math.min(11, Math.max(0, Math.floor(Number.isFinite(ageMonths) ? ageMonths : 0)));

    if (years === 0 && months === 0) {
      setFormErrors(prev => ({ ...prev, age: 'Please enter a valid age' }));
      return false;
    }
    if (years > 120) {
      setFormErrors(prev => ({ ...prev, age: 'Age cannot exceed 120 years' }));
      return false;
    }
    setFormErrors(prev => ({ ...prev, age: undefined }));
    return true;
  };

  const validateSymptoms = (): boolean => {
    if (selectedSymptoms.length < 3) {
      setFormErrors(prev => ({ ...prev, symptoms: 'Please select at least 3 symptoms' }));
      return false;
    }
    setFormErrors(prev => ({ ...prev, symptoms: undefined }));
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 'age' && validateAge()) {
      setCurrentStep('symptoms');
    } else if (currentStep === 'symptoms' && validateSymptoms()) {
      handlePredict();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 'symptoms') {
      setCurrentStep('age');
    }
  };

  const handleClearPredictions = () => {
    setPredictions([]);
    setSelectedSymptoms([]);
    setShowResults(false);
    setCurrentStep('age');
    localStorage.removeItem('rareDiseasePredictionData');
  };

  const handleReset = () => {
    // Clear all state
    setPredictions([]);
    setSelectedSymptoms([]);
    setAgeYears(0);
    setAgeMonths(0);
    setShowResults(false);
    setCurrentStep('age');
    setFormErrors({});

    // Clear local storage
    localStorage.removeItem('rareDiseasePredictionData');

    // Show success message
    toast({
      title: 'Reset successful',
      description: 'All data has been cleared. You can start a new analysis.',
    });
  };

  const handlePredict = async () => {
    if (!validateAge() || !validateSymptoms()) {
      return;
    }

    setIsLoading(true);
    setFormErrors({});

    try {
      // Call the prediction API with the correct parameters
      const result = await predictRareDiseases(
        selectedSymptoms,
        ageYears * 12 + ageMonths
      );

      // Generate a prediction ID if we don't have one
      const newPredictionId = urlPredictionId || uuidv4();
      setPredictionId(newPredictionId);

      // Update state with the prediction results
      setPredictions(result.diseases);
      setShowResults(true);
      setCurrentStep('results');

      // Update URL with the prediction ID
      navigate(`/predictions/${newPredictionId}`, { replace: true });

      // Scroll to results
      setTimeout(() => {
        const resultsElement = document.getElementById('results-section');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      console.error('Prediction error:', error);
      toast({
        title: 'Prediction Error',
        description: 'An error occurred while making predictions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const navItems = [
    { name: "Home", link: "#", icon: <Home className="h-4 w-4" /> },
    { name: "Analyze", link: "#get-started", icon: <Search className="h-4 w-4" /> },
    { name: "About", link: "#how-it-works", icon: <Info className="h-4 w-4" /> },
  ];



  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">

        {/* Hero Section */}
        {currentStep === 'age' && (
          <div id="home">
            <HeroSection
              title="Rare Disease Detection"
              subtitle="AI-Powered, Accurate, Fast, Reliable, Trusted"
              description="Get instant insights into potential rare diseases based on your symptoms and medical history."
              primaryButtonText="Get Started"
              secondaryButtonText="Learn More"
            />
          </div>
        )}

        {/* Prediction Form */}
        <section id="prediction-section" className="py-16 md:py-20 lg:py-28 relative">
          <div className="container mx-auto px-4">
            <div className="w-full max-w-4xl mx-auto space-y-6">

              {/* Step Indicator */}
              <div className="flex justify-center mb-8">
                <div className="flex items-center">
                  <div
                    className={`flex flex-col items-center ${currentStep === 'age' ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep === 'age' ? 'bg-[#DFDAE4]' : 'bg-muted'}`}>
                      <span className="font-semibold">1</span>
                    </div>
                    <span className="text-sm font-medium">Age</span>
                  </div>

                  <div className={`h-0.5 w-16 mx-2 ${currentStep === 'symptoms' || currentStep === 'results' ? 'bg-primary' : 'bg-muted'}`}></div>

                  <div
                    className={`flex flex-col items-center ${currentStep === 'symptoms' ? 'text-primary' : currentStep === 'results' ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep === 'symptoms' || currentStep === 'results' ? 'bg-[#DFDAE4]' : 'bg-muted'}`}>
                      <span className="font-semibold">2</span>
                    </div>
                    <span className="text-sm font-medium">Symptoms</span>
                  </div>

                  <div className={`h-0.5 w-16 mx-2 ${currentStep === 'results' ? 'bg-primary' : 'bg-muted'}`}></div>

                  <div
                    className={`flex flex-col items-center ${currentStep === 'results' ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep === 'results' ? 'bg-[#DFDAE4]' : 'bg-muted'}`}>
                      <span className="font-semibold">3</span>
                    </div>
                    <span className="text-sm font-medium">Results</span>
                  </div>
                </div>
              </div>

              {/* Age Step */}
              {currentStep === 'age' && (
                <Card className="shadow-2xl border border-border/50 bg-card/90 backdrop-blur-xl">
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-jakarta font-bold text-xl text-foreground">Age Information</h3>
                          <p className="text-muted-foreground text-sm">Required for accurate analysis</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-foreground/90">
                            Years
                          </label>
                          <div className="relative">
                            <Input
                              type="text"                     // use text to fully control what's allowed
                              inputMode="numeric"             // mobile numeric keypad
                              pattern="\d*"
                              autoComplete="off"
                              value={ageYears === 0 ? '' : String(ageYears)}
                              onKeyDown={(e) => {
                                if (BLOCKED_KEYS.has(e.key)) e.preventDefault();
                                // allow control/navigation keys; block any non-digit
                                if (!e.ctrlKey && !e.metaKey && e.key.length === 1 && /\D/.test(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              onPaste={(e) => {
                                e.preventDefault();
                                const digits = sanitizePaste(e.clipboardData.getData('text'));
                                const next = clamp(parseInt(digits || '0', 10), 0, 120);
                                setAgeYears(next);
                              }}
                              onChange={(e) => {
                                const digits = e.target.value.replace(/\D+/g, '');
                                const next = clamp(parseInt(digits || '0', 10), 0, 120);
                                // preserve empty string for UX so the field can be cleared
                                if (digits === '') setAgeYears(0);
                                else setAgeYears(next);
                              }}
                              onWheel={(e) => (e.target as HTMLInputElement).blur()}  // prevent mouse-wheel changing values
                              placeholder="0"
                              className="pr-8"
                            />

                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">yrs</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-foreground/90">
                            Months
                            <span className="text-muted-foreground text-xs ml-1">(0-11)</span>
                          </label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={ageMonths === 0 ? '' : ageMonths}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '') setAgeMonths(0);
                                else {
                                  const numValue = parseInt(value, 10);
                                  if (!isNaN(numValue)) setAgeMonths(Math.min(11, Math.max(0, numValue)));
                                }
                              }}
                              min="0"
                              max="11"
                              className="pr-8"
                              placeholder="0"
                            />
                            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">mos</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start flex-col gap-2 pt-4 border-t border-border/20">
                        <div className="flex gap-2">
                          <Info className="h-4 w-4 mt-0.5 text-muted-foreground/70 flex-shrink-0" />
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            For ages under 1 year, set years to 0. Predictions use whole years for analysis.
                          </p></div>
                        <div className="flex gap-2">
                          <Info className="h-4 w-4 mt-0.5 text-muted-foreground/70 flex-shrink-0" />
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Rare Predict estimates possible rare genetic conditions only; it is not a general symptom checker or a diagnostic tool. Use only after high genetic risk has been identified. Results are informational; review with a qualified healthcare professional for clinical guidance.
                          </p>

                        </div>
                      </div>

                      {formErrors.age && (
                        <p className="text-sm text-destructive">{formErrors.age}</p>
                      )}

                      <div className="flex justify-end pt-2">
                        <Button onClick={handleNextStep} className="px-6">
                          Next: Add Symptoms <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Symptoms Step */}
              {currentStep === 'symptoms' && (
                <Card className="shadow-2xl border border-border/50 bg-card/90 backdrop-blur-xl">
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-[#DFDAE4] rounded-lg">
                          <Search className="h-5 w-5 text-black" />
                        </div>
                        <div>
                          <h3 className="font-jakarta font-bold text-xl text-foreground">Enter Your Symptoms</h3>
                          <p className="text-muted-foreground text-sm">Select at least 3 symptoms for accurate analysis</p>
                        </div>
                      </div>

                      <div id="symptom-section" className="scroll-mt-24">
                        <SymptomSelector
                          selectedSymptoms={selectedSymptoms}
                          onSymptomsChange={setSelectedSymptoms}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                        <span className={selectedSymptoms.length < 3 ? 'text-amber-500' : 'text-success'}>
                          {selectedSymptoms.length >= 3 ? '✓ ' : ''}
                          {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? 's' : ''} selected
                        </span>
                        <span className={selectedSymptoms.length < 3 ? 'text-amber-500' : 'text-muted-foreground'}>
                          {Math.max(0, 3 - selectedSymptoms.length)} more needed
                        </span>
                      </div>

                      {formErrors.symptoms && (
                        <p className="text-sm text-destructive">{formErrors.symptoms}</p>
                      )}

                      <div className="flex justify-between pt-2">
                        <Button
                          variant="outline"
                          onClick={handlePreviousStep}
                          className="hover:bg-white hover:text-black"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Age
                        </Button>
                        <Button
                          onClick={handleNextStep}
                          className="px-6"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            'Analyze Symptoms'
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Results Step */}
              {currentStep === 'results' && showResults && (
                <div className="space-y-6" id="results">
                  <Card className="shadow-sm border border-border/30 bg-card/90 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center justify-center py-2">
                        <div className="bg-[#DFDAE4] p-2 rounded-full mb-2">
                          <CheckCircle className="h-6 w-6 bg-[#DFDAE4]" />
                        </div>
                        <h3 className="text-lg font-semibold text-center mb-1">Analysis Complete</h3>
                        <p className="text-muted-foreground text-center text-sm max-w-md mb-3">
                          Potential conditions based on your symptoms are listed below.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleReset}
                          className="text-xs hover:bg-white hover:text-black"
                        >
                          Reset & Start New Analysis
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                      <p className="text-muted-foreground">Analyzing symptoms...</p>
                    </div>
                  ) : predictions.length > 0 ? (
                    <div className="bg-card/50 border border-border/50 rounded-xl p-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                      <ResultsSection
                        predictions={predictions}
                        isLoading={isLoading}
                        onClear={handleClearPredictions}
                        onBack={() => {
                          setPredictions([]);
                          setSelectedSymptoms([]);
                          setShowResults(false);
                          setCurrentStep('symptoms');
                          setFormErrors({});
                          requestAnimationFrame(() => {
                            const symptomSection = document.getElementById('symptom-section');
                            if (symptomSection) {
                              const yOffset = -80;
                              const y = symptomSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                              window.scrollTo({ top: y, behavior: 'smooth' });
                            } else {
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          });
                        }}
                        predictionId={predictionId}
                        className="mt-8"
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-muted/30 rounded-lg">
                      <Info className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No predictions found. Try adjusting your symptoms.</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        {currentStep === 'age' && (
          <section className="py-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent" />
            <div className="max-w-7xl mx-auto px-4 relative">
              <div className="text-center mb-12">
                <h2 className="font-jakarta text-3xl font-bold text-foreground mb-4">Trusted by Healthcare Professionals</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Built with the highest standards of security, accuracy, and clinical validation</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="backdrop-blur-sm p-6 rounded-xl border border-border/30 bg-[#DFDAE4]">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#DFDAE4]">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-jakarta text-xl font-bold mb-2">Secure & Private</h3>
                  <p className="text-muted-foreground">Your health data is encrypted and never shared without your consent.</p>
                </div>

                <div className="backdrop-blur-sm p-6 rounded-xl border border-border/30 bg-[#DFDAE4]">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#DFDAE4]">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-jakarta text-xl font-bold mb-2">Evidence-Based</h3>
                  <p className="text-muted-foreground">Powered by the latest medical research and validated clinical data</p>
                </div>

                <div className="backdrop-blur-sm p-6 rounded-xl border border-border/30 bg-[#DFDAE4]">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#DFDAE4]">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-jakarta text-xl font-bold mb-2">Clinical Validation</h3>
                  <p className="text-muted-foreground">Developed in collaboration with medical professionals</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        {currentStep === 'age' && <Footer />}
      </main>
    </div>
  );











};

export default Index;
