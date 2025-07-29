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
      <section className="py-16 bg-gradient-to-b from-slate-900/50 to-background relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-12">
            <h2 className="font-jakarta text-3xl font-bold text-foreground mb-4">Trusted by Healthcare Professionals</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Built with the highest standards of security, accuracy, and clinical validation</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group flex items-center gap-6 p-8 bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg border border-border/50 hover:shadow-xl hover:border-accent/30 transition-all duration-300">
              <div className="flex items-center justify-center w-16 h-16 bg-success/10 rounded-2xl group-hover:bg-success/20 transition-colors">
                <Shield className="h-8 w-8 text-success" />
              </div>
              <div>
                <h3 className="font-jakarta font-bold text-xl text-foreground mb-2">HIPAA Compliant</h3>
                <p className="text-muted-foreground leading-relaxed">Your health data is secure and protected with enterprise-grade encryption</p>
              </div>
            </div>
            <div className="group flex items-center gap-6 p-8 bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg border border-border/50 hover:shadow-xl hover:border-accent/30 transition-all duration-300">
              <div className="flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl group-hover:bg-accent/20 transition-colors">
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h3 className="font-jakarta font-bold text-xl text-foreground mb-2">Evidence-Based</h3>
                <p className="text-muted-foreground leading-relaxed">Powered by the latest medical research and validated clinical data</p>
              </div>
            </div>
            <div className="group flex items-center gap-6 p-8 bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg border border-border/50 hover:shadow-xl hover:border-accent/30 transition-all duration-300">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-jakarta font-bold text-xl text-foreground mb-2">AI-Powered</h3>
                <p className="text-muted-foreground leading-relaxed">Advanced machine learning algorithms trained on millions of cases</p>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Main Prediction Form */}
        <section id="get-started" className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
              <Activity className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">AI-Powered Analysis</span>
            </div>
            <h2 className="font-jakarta text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Start Your Health
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Analysis Today
              </span>
            </h2>
            <p className="text-muted-foreground font-jakarta text-xl max-w-3xl mx-auto leading-relaxed">
              Enter your symptoms and age to receive comprehensive AI-powered insights into potential rare diseases. 
              Our advanced algorithm analyzes complex patterns to provide accurate, personalized predictions.
            </p>
          </div>

          <Card className="max-w-3xl mx-auto mb-16 bg-card/60 backdrop-blur-xl shadow-2xl border-0 ring-1 ring-border/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5" />
            <CardContent className="relative p-10 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-jakarta font-bold text-xl text-foreground">Symptom Analysis</h3>
                    <p className="text-muted-foreground">Select all symptoms you're experiencing</p>
                  </div>
                </div>
                <SymptomSelector 
                  selectedSymptoms={selectedSymptoms}
                  onSymptomsChange={setSelectedSymptoms}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-lg">
                    <Users className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-jakarta font-bold text-xl text-foreground">Age Information</h3>
                    <p className="text-muted-foreground">Required for accurate analysis and predictions</p>
                  </div>
                </div>
                <Input
                  type="number"
                  min="1"
                  max="120"
                  placeholder="Enter your age (1-120)"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="font-jakarta text-lg h-14 border-border/50 focus:border-accent bg-background/50 backdrop-blur-sm"
                />
              </div>

              <Button 
                onClick={handlePredict}
                disabled={isLoading}
                className="w-full font-jakarta font-bold text-lg h-16 bg-gradient-to-r from-primary via-accent to-primary bg-size-200 hover:bg-pos-100 transition-all duration-500 shadow-lg hover:shadow-xl relative overflow-hidden group"
                size="lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                {isLoading ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                    Analyzing your symptoms...
                  </>
                ) : (
                  <>
                    <Activity className="h-6 w-6 mr-3" />
                    Analyze & Predict Rare Diseases
                  </>
                )}
              </Button>
              
              <div className="flex items-center justify-center gap-2 pt-4">
                <CheckCircle className="h-4 w-4 text-success" />
                <p className="text-sm text-muted-foreground text-center font-jakarta">
                  This tool is for informational purposes only and should not replace professional medical advice.
                </p>
              </div>
            </CardContent>
          </Card>

        {predictions.length > 0 && (
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full border border-success/20">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">Analysis Complete</span>
              </div>
              <h2 className="font-jakarta text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Your Analysis
                <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Results
                </span>
              </h2>
              <p className="text-muted-foreground font-jakarta text-xl max-w-4xl mx-auto leading-relaxed">
                Based on your symptoms and age, here are potential rare diseases to consider. 
                Each result includes detailed information, medical resources, and next steps for consultation.
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
