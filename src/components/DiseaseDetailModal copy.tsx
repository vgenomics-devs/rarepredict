import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  X,
  ArrowLeft,
  AlertCircle,
  Check,
  ExternalLink as ExternalLinkIcon
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { SymptomProfile } from './SymptomProfile';
import '@/index.css'

interface HpoDetail {
  hpo_id: string;
  hpo_name: string;
  matched: boolean;
  connected_nodes?: Array<{
    hpo_id: string;
    hpo_name: string;
    relation?: string;
    score?: number;
  }>;
  connected_hpos?: Array<{
    hpo_id: string;
    hpo_name: string;
    relation?: string;
  }>;
}

interface Disease {
  id: string;
  name: string;
  confidence: number;
  matchPercentage: string;
  matchedNodes: string;
  matchingHpoIds: string;
  rank: number;
  weight: number;
  description: string;
  symptoms: string[];
  prevalence: string;
  links: { title: string; url: string }[];
  hpoDetails?: HpoDetail[];
}

interface DiseaseHpoResponse {
  disease_id: string;
  disease_name: string;
  symptoms: Array<{
    hpo_id: string;
    hpo_name: string;
    matched: boolean | null;
    connected_hpos?: Array<{
      hpo_id: string;
      hpo_name: string;
    }>;
  }>;
  total_symptoms: number;
  matched_symptoms: number;
}

interface LocationState {
  disease?: Disease & {
    hpoDetails?: Array<{
      hpo_id: string;
      hpo_name: string;
      matched: boolean;
    }>;
  };
  selectedSymptoms?: string[];
}

interface ExtendedDisease extends Omit<Disease, 'matchedNodes'> {
  hpoDetails?: Array<{
    hpo_id: string;
    hpo_name: string;
    matched: boolean;
  }>;
  matchedNodes?: string;
  confidence: number;
}

interface DiseaseHPOListProps {
  hpos: Array<{
    hpo_id: string;
    hpo_name: string;
    matched: boolean | null;
  }>;
  onViewHPODetails?: (hpoId: string) => void;
  className?: string;
}

const DiseaseHPOList: React.FC<DiseaseHPOListProps> = ({
  hpos,
  onViewHPODetails,
  className = ''
}) => {
  if (!hpos || hpos.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        No HPO terms found for this disease.
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {hpos.map((hpo) => (
        <div
          key={hpo.hpo_id}
          className={`p-4 rounded-lg border transition-colors ${hpo.matched
            ? 'bg-green-50 border-green-200 hover:bg-green-100'
            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
        >
          <div className="flex items-start">
            <div className={`p-2 rounded-full mr-3 ${hpo.matched
              ? 'bg-green-100 text-green-600'
              : 'bg-gray-100 text-gray-400'
              }`}>
              {hpo.matched ? <Check size={18} /> : <X size={18} />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className={`font-medium ${hpo.matched ? 'text-green-900' : 'text-gray-900'
                  }`}>
                  {hpo.hpo_name || 'Unnamed HPO Term'}
                </h4>
                {hpo.matched && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                    Matched
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-500 font-mono">
                  {hpo.hpo_id}
                </span>
                {onViewHPODetails && (
                  <button
                    onClick={() => onViewHPODetails(hpo.hpo_id)}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    View Details
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export function DiseaseDetailModal() {
  const { id: diseaseId } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [disease, setDisease] = useState<ExtendedDisease | null>(null);
  const [symptoms, setSymptoms] = useState<DiseaseHpoResponse | null>(null);
  const [symptomFilter, setSymptomFilter] = useState<'all' | 'matched' | 'unmatched'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiseaseData = useCallback(async () => {
    try {
      setLoading(true);
      const state = location.state as LocationState;

      if (!state?.disease) {
        console.error('No disease data in location state');
        setError('Disease data not found');
        setLoading(false);
        return;
      }

      const diseaseData = state.disease;
      setDisease(diseaseData);

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const predictionId = urlParams.get('uuid') || '550e8400-e29b-41d4-a716-446655440000';
        const selectedSymptoms = state.selectedSymptoms || [];
        const matchedHposParam = selectedSymptoms.join(',');


        const apiUrl = `http://localhost:5000/disease/hpos?disease=${encodeURIComponent(diseaseData.id)}${matchedHposParam ? `&matched_hpos=${encodeURIComponent(matchedHposParam)}` : ''}`;

        const response = await fetch(apiUrl);

        const responseText = await response.text();

        if (!response.ok) {
          console.error('API Error Response:', responseText);
          throw new Error(`Failed to fetch symptoms: ${response.status} ${response.statusText}`);
        }

        let symptomsData;
        try {
          symptomsData = JSON.parse(responseText);
        } catch (e) {
          console.error('Failed to parse API response:', e, 'Response text:', responseText);
          throw new Error('Invalid JSON response from server');
        }

        // Ensure we have the expected data structure
        if (!symptomsData || !Array.isArray(symptomsData.symptoms)) {
          console.error('Unexpected API response structure:', symptomsData);
          throw new Error('Invalid data format received from server');
        }

        type SymptomItem = {
          hpo_id: string;
          hpo_name: string;
          matched: boolean;
          connected_hpos?: Array<{
            hpo_id: string;
            hpo_name: string;
          }>;
        };

        const processedSymptoms: DiseaseHpoResponse = {
          disease_id: symptomsData.disease_id || diseaseData.id,
          disease_name: symptomsData.disease_name || diseaseData.name,
          symptoms: symptomsData.symptoms.map((s: SymptomItem) => ({
            hpo_id: s.hpo_id || '',
            hpo_name: s.hpo_name || 'Unnamed Symptom',
            matched: s.matched || false,
            connected_hpos: s.connected_hpos || []
          })),
          total_symptoms: symptomsData.total_symptoms || symptomsData.symptoms.length,
          matched_symptoms: symptomsData.matched_symptoms || symptomsData.symptoms.filter((s: SymptomItem) => s.matched).length
        };

        setSymptoms(processedSymptoms);
      } catch (err) {
        console.error('Error in fetchDiseaseData:', err);
        // Fallback to any hpoDetails that might be in the disease data
        if (diseaseData.hpoDetails?.length) {
          const processedSymptoms: DiseaseHpoResponse = {
            disease_id: diseaseData.id,
            disease_name: diseaseData.name,
            symptoms: diseaseData.hpoDetails.map(hpo => ({
              hpo_id: hpo.hpo_id,
              hpo_name: hpo.hpo_name,
              matched: hpo.matched || false
            })),
            total_symptoms: diseaseData.hpoDetails.length,
            matched_symptoms: diseaseData.hpoDetails.filter(hpo => hpo.matched).length
          };
          setSymptoms(processedSymptoms);
        } else {
          setError(`Failed to load symptoms: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
    } catch (err) {
      console.error('Error in fetchDiseaseData:', err);
      setError('Failed to load disease details');
    } finally {
      setLoading(false);
    }
  }, [location.state]);

  useEffect(() => {
    fetchDiseaseData();
  }, [fetchDiseaseData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !disease) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to results
        </Button>
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'Disease not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to results
        </Button>

        <Card className="w-full">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold">{disease.name}</CardTitle>
                <CardDescription>{disease.description}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={disease.confidence >= 80 ? "default" : "secondary"}>
                  {disease.confidence}% Match
                </Badge>
                {symptoms && (
                  <Badge variant="outline">
                    {symptoms.matched_symptoms} of {symptoms.total_symptoms} symptoms matched
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="symptoms" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="symptoms">Symptom Profile</TabsTrigger>
                <TabsTrigger value="details">Disease Details</TabsTrigger>
              </TabsList>

              <TabsContent value="symptoms" className="space-y-4">
                {/* Raw API Response */}
                <Card>
                  <CardHeader>
                    <CardTitle>HPO API Response (Debug)</CardTitle>
                    <CardDescription>Raw data from the HPO API endpoint</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-80">
                      <pre className="text-xs">
                        <code>{symptoms ? JSON.stringify(symptoms, null, 2) : 'No symptom data available'}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                {/* Simplified Symptom List */}
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle>Symptom Profile</CardTitle>
                        <CardDescription>
                          {symptoms ? (
                            `Showing ${symptoms.symptoms.length} symptoms (${symptoms.matched_symptoms} matched)`
                          ) : (
                            "Loading symptom data..."
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={symptomFilter === 'all' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSymptomFilter('all')}
                        >
                          All
                        </Button>
                        <Button
                          variant={symptomFilter === 'matched' ? 'default' : 'outline'}
                          size="sm"
                          className="bg-green-50 text-green-800 hover:bg-green-100 hover:text-green-900"
                          onClick={() => setSymptomFilter('matched')}
                        >
                          Matched
                        </Button>
                        <Button
                          variant={symptomFilter === 'unmatched' ? 'default' : 'outline'}
                          size="sm"
                          className="bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700"
                          onClick={() => setSymptomFilter('unmatched')}
                        >
                          Unmatched
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {symptoms ? (
                      <div className="space-y-6">
                        {symptoms.symptoms
                          .filter(symptom => {
                            if (symptomFilter === 'matched') return symptom.matched;
                            if (symptomFilter === 'unmatched') return !symptom.matched;
                            return true;
                          })
                          .map((symptom, index) => (
                            <SymptomProfile
                              key={`${symptom.hpo_id}-${index}`}
                              symptom={symptom}
                              className="shadow-sm"
                            />
                          ))}

                        {symptoms.symptoms.filter(symptom => {
                          if (symptomFilter === 'matched') return symptom.matched;
                          if (symptomFilter === 'unmatched') return !symptom.matched;
                          return true;
                        }).length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              No symptoms found matching the current filter.
                            </div>
                          )}
                      </div>
                    ) : (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Disease Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {disease.prevalence && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Prevalence</h4>
                        <p>{disease.prevalence}</p>
                      </div>
                    )}
                    {disease.links && disease.links.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Learn More</h4>
                        <div className="space-y-2">
                          {disease.links.map((link, index) => (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <ExternalLinkIcon className="h-3 w-3" />
                              {link.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}