import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, AlertCircle, BarChart3, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { mockDiseases, type Disease } from "@/lib/mockApi";

const DiseaseDetails = () => {
  const { diseaseId } = useParams<{ diseaseId: string }>();
  const navigate = useNavigate();
  const [disease, setDisease] = useState<Disease | null>(null);

  useEffect(() => {
    if (diseaseId) {
      // In a real app, this would be an API call
      const foundDisease = mockDiseases.find(d => d.id === diseaseId);
      setDisease(foundDisease || null);
    }
  }, [diseaseId]);

  if (!disease) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-jakarta text-xl font-bold mb-2">Disease Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested disease information could not be found.</p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Predictor
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-success text-success-foreground";
    if (confidence >= 60) return "bg-accent text-accent-foreground";
    return "bg-secondary text-secondary-foreground";
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Predictor
            </Button>
          </div>
          
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="font-jakarta text-3xl font-bold text-foreground">{disease.name}</h1>
              <p className="text-muted-foreground font-jakarta text-lg max-w-3xl">
                {disease.description}
              </p>
            </div>
            
            <Badge className={getConfidenceColor(disease.confidence)} variant="secondary">
              {disease.confidence}% Match
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <FileText className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="symptoms" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Symptoms
            </TabsTrigger>
            <TabsTrigger value="epidemiology" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Epidemiology
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-2">
              <Users className="h-4 w-4" />
              Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-jakarta">Disease Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-jakarta font-semibold mb-2">Description</h4>
                    <p className="text-muted-foreground font-jakarta leading-relaxed">
                      {disease.description}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-jakarta font-semibold mb-2">Prevalence</h4>
                    <p className="text-muted-foreground font-jakarta">
                      {disease.prevalence}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-jakarta font-semibold mb-2">Prediction Confidence</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getConfidenceColor(disease.confidence)}>
                        {disease.confidence}%
                      </Badge>
                      <span className="text-sm text-muted-foreground font-jakarta">
                        Based on symptom analysis
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-jakarta">Key Facts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex justify-between">
                      <span className="font-jakarta font-medium">Disease Type:</span>
                      <span className="text-muted-foreground font-jakarta">Rare Disease</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-jakarta font-medium">Classification:</span>
                      <span className="text-muted-foreground font-jakarta">Genetic/Acquired</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-jakarta font-medium">Onset:</span>
                      <span className="text-muted-foreground font-jakarta">Variable</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-jakarta font-medium">Prognosis:</span>
                      <span className="text-muted-foreground font-jakarta">Variable</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="symptoms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-jakarta">Associated Symptoms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {disease.symptoms.map((symptom, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg"
                    >
                      <AlertCircle className="h-4 w-4 text-accent flex-shrink-0" />
                      <span className="font-jakarta text-sm">{symptom}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-jakarta">Symptom Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-jakarta leading-relaxed">
                  The symptoms typically present in a progressive pattern, with early manifestations 
                  including {disease.symptoms.slice(0, 2).join(' and ')}, followed by more complex 
                  presentations as the condition advances.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="epidemiology" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-jakarta">Prevalence Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-jakarta font-semibold mb-2">Global Prevalence</h4>
                    <p className="text-muted-foreground font-jakarta">
                      {disease.prevalence}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-jakarta font-semibold mb-2">Age of Onset</h4>
                    <p className="text-muted-foreground font-jakarta">
                      Variable, typically diagnosed in childhood to early adulthood
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-jakarta font-semibold mb-2">Geographic Distribution</h4>
                    <p className="text-muted-foreground font-jakarta">
                      Worldwide distribution with some regional variations
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-jakarta">Demographics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-jakarta font-semibold mb-2">Gender Distribution</h4>
                    <p className="text-muted-foreground font-jakarta">
                      Affects both males and females equally
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-jakarta font-semibold mb-2">Inheritance Pattern</h4>
                    <p className="text-muted-foreground font-jakarta">
                      Variable depending on specific subtype
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-jakarta">External Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {disease.links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div>
                        <h4 className="font-jakarta font-semibold group-hover:text-accent transition-colors">
                          {link.title}
                        </h4>
                        <p className="text-sm text-muted-foreground font-jakarta">
                          External medical resource
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-jakarta">Support Organizations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-jakarta font-semibold mb-1">National Organization for Rare Disorders (NORD)</h4>
                    <p className="text-sm text-muted-foreground font-jakarta">
                      Comprehensive resource for rare disease information and patient support
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-jakarta font-semibold mb-1">Rare Disease Foundation</h4>
                    <p className="text-sm text-muted-foreground font-jakarta">
                      Global advocacy and research funding organization
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DiseaseDetails;