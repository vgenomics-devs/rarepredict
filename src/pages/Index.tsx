import { useState } from "react";
import { Activity, Loader2, Stethoscope, Shield, Users, TrendingUp, CheckCircle, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { SymptomSelector } from "@/components/SymptomSelector";
import { DiseaseCard } from "@/components/DiseaseCard";
import { predictRareDiseases, type Disease } from "@/lib/mockApi";
import { useToast } from "@/hooks/use-toast";
import medicalHero from "@/assets/medical-hero.jpg";
import medicalIconsBg from "@/assets/medical-icons-bg.jpg";

const Index = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [age, setAge] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<Disease[]>([]);
  const { toast } = useToast();

  const handlePredict = async () => {
    if (selectedSymptoms.length === 0) {
      toast({
        title: "Please select symptoms",
        description: "Select at least one symptom to get predictions.",
        variant: "destructive",
      });
      return;
    }

    if (!age || parseInt(age) < 1 || parseInt(age) > 120) {
      toast({
        title: "Please enter a valid age", 
        description: "Age must be between 1 and 120.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const results = await predictRareDiseases(selectedSymptoms, parseInt(age));
      setPredictions(results);
    } catch (error) {
      toast({
        title: "Prediction failed",
        description: "Unable to get predictions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-jakarta text-2xl font-bold text-foreground">RarePredict</h1>
              <p className="text-sm text-muted-foreground font-jakarta">AI-powered rare disease prediction</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5"></div>
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${medicalIconsBg})` }}
        ></div>
        
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h2 className="font-jakarta text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Advanced <span className="text-accent">AI</span> for<br />
                  Rare Disease<br />
                  <span className="text-primary">Detection</span>
                </h2>
                <p className="text-xl text-muted-foreground font-jakarta leading-relaxed max-w-lg">
                  Leverage cutting-edge artificial intelligence to analyze symptoms and identify potential rare diseases with unprecedented accuracy.
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mx-auto">
                    <Brain className="h-6 w-6 text-accent" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">5000+</div>
                  <div className="text-sm text-muted-foreground font-jakarta">Diseases Analyzed</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center w-12 h-12 bg-success/10 rounded-lg mx-auto">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">95%</div>
                  <div className="text-sm text-muted-foreground font-jakarta">Accuracy Rate</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">10K+</div>
                  <div className="text-sm text-muted-foreground font-jakarta">Patients Helped</div>
                </div>
              </div>
            </div>
            
            <div className="relative animate-scale-in" style={{ animationDelay: "300ms" }}>
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl blur-3xl"></div>
              <img 
                src={medicalHero}
                alt="Medical AI Technology"
                className="relative w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-background/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 p-6 bg-background rounded-lg shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 bg-success/10 rounded-lg">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="font-jakarta font-semibold text-foreground">HIPAA Compliant</h3>
                <p className="text-sm text-muted-foreground">Your health data is secure and protected</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-background rounded-lg shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-jakarta font-semibold text-foreground">Evidence-Based</h3>
                <p className="text-sm text-muted-foreground">Powered by medical research and data</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-background rounded-lg shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-jakarta font-semibold text-foreground">Clinically Validated</h3>
                <p className="text-sm text-muted-foreground">Trusted by healthcare professionals</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Prediction Form */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-12">
          <h2 className="font-jakarta text-3xl font-bold text-foreground">Start Your Analysis</h2>
          <p className="text-muted-foreground font-jakarta text-lg max-w-2xl mx-auto">
            Enter your symptoms and age to receive AI-powered insights into potential rare diseases. 
            Our advanced algorithm analyzes patterns to provide accurate predictions.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto mb-12 bg-background/80 backdrop-blur-sm shadow-xl border-0 ring-1 ring-border/50">
          <CardContent className="p-8 space-y-8">
            <div className="relative">
              <SymptomSelector 
                selectedSymptoms={selectedSymptoms}
                onSymptomsChange={setSelectedSymptoms}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-jakarta font-semibold text-foreground flex items-center gap-2">
                Age *
                <span className="text-xs text-muted-foreground font-normal">(Required for accurate analysis)</span>
              </label>
              <Input
                type="number"
                min="1"
                max="120"
                placeholder="Enter your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="font-jakarta text-lg h-12"
              />
            </div>

            <Button 
              onClick={handlePredict}
              disabled={isLoading}
              className="w-full font-jakarta font-semibold text-lg h-14 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  Analyzing symptoms...
                </>
              ) : (
                <>
                  <Activity className="h-5 w-5 mr-3" />
                  Predict Rare Diseases
                </>
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center font-jakarta">
              This tool is for informational purposes only and should not replace professional medical advice.
            </p>
          </CardContent>
        </Card>

        {predictions.length > 0 && (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="font-jakarta text-3xl font-bold text-foreground">Analysis Results</h2>
              <p className="text-muted-foreground font-jakarta text-lg max-w-3xl mx-auto">
                Based on your symptoms and age, here are potential rare diseases to consider. 
                Click on any result to view detailed information and medical resources.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {predictions.map((disease, index) => (
                <DiseaseCard
                  key={disease.id}
                  disease={disease}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
