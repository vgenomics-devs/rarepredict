import { useState } from "react";
import { Activity, Loader2, Stethoscope, Shield, Users, TrendingUp, CheckCircle, Brain, Search, Info, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { SymptomSelector } from "@/components/SymptomSelector";
import { DiseaseCard } from "@/components/DiseaseCard";
import { predictRareDiseases, type Disease } from "@/lib/mockApi";
import { useToast } from "@/hooks/use-toast";
import { HeroSection } from "@/components/HeroSection";
import { FloatingNav } from "@/components/ui/navbar";

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

  const navItems = [
    { name: "Home", link: "#", icon: <Home className="h-4 w-4" /> },
    { name: "Analyze", link: "#get-started", icon: <Search className="h-4 w-4" /> },
    { name: "About", link: "#how-it-works", icon: <Info className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <FloatingNav navItems={navItems} />
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          title="Your health journey starts with"
          subtitle="understanding, clarity, precision, empowerment"
          description="AI-powered insights to help you understand and navigate rare health conditions with confidence. Our advanced analysis provides personalized information to support your health journey."
          primaryButtonText="Get Started"
          primaryButtonHref="#get-started"
          secondaryButtonText="Learn More"
          secondaryButtonHref="#how-it-works"
        />
      
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
            </div>p[]
          </div>
        </div>
      </section>

        {/* Main Prediction Form */}
        <section id="get-started" className="max-w-7xl mx-auto px-4 py-16">
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
      </section>
      </main>
    </div>
  );
};

export default Index;
