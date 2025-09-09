import React, { useState, useEffect, ReactElement } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  BookOpen,
  Dna,
  HeartPulse,
  Stethoscope,
  Users,
  Activity,
  LayoutDashboard,
  ArrowLeft,
  Search,
  ExternalLink,
  ChevronRight,
  FileText,
  ClipboardList,
  ClipboardCheck,
  ShieldCheck,
  LifeBuoy
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockDiseases, type Disease, type HpoDetail, getDiseaseHpos, type DiseaseHpoResponse, getMatchedHpoIds, getDiseaseInfo, loginAndGetToken, type DiseaseInfoResponse } from "@/lib/mockApi";
import { SymptomProfile } from "@/components/SymptomProfile";
import '@/index.css'

interface Section {
  id: string;
  title: string;
  icon: ReactElement;
}

// Extend the Disease type to include hpoDetails
interface ExtendedDisease extends Disease {
  hpoDetails?: HpoDetail[];
}

interface LocationState {
  disease: ExtendedDisease;
  selectedSymptoms?: string[];
}

const DiseaseDetails = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const normalizeHpoId = (id: string) => {
    if (!id) return id;
    const t = id.trim().toUpperCase();
    return t.startsWith('HP:') ? t : `HP:${t.replace(/^HP/, '')}`;
  };
  const { diseaseId } = useParams<{ diseaseId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [disease, setDisease] = useState<ExtendedDisease | null>(null);
  const [symptoms, setSymptoms] = useState<DiseaseHpoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [symptomQuery, setSymptomQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [diseaseInfo, setDiseaseInfo] = useState<Partial<DiseaseInfoResponse> | null>(null);
  const [diseaseData, setDiseaseData] = useState<DiseaseInfoResponse | null>(null);

  useEffect(() => {
    const fetchDiseaseData = async () => {
      try {
        setLoading(true);

        // Get prediction ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const predictionId = urlParams.get('uuid');

        if (!predictionId) {
          throw new Error('Prediction ID (UUID) is required');
        }

        // Get RDX token for API calls
        const rdxToken = await loginAndGetToken();
        if (!rdxToken) {
          console.warn('Failed to get RDX token, some features may be limited');
        }

        // Get disease data from location state or find by ID
        if (location.state?.disease) {
          const diseaseData = location.state.disease as ExtendedDisease;
          setDisease(diseaseData);

          // Fetch disease info for overview
          try {
            const info = await getDiseaseInfo(diseaseData.name, rdxToken);
            // Handle the case where info is an array (take first item if array)
            const diseaseInfoData = Array.isArray(info) ? info[0] : info;
            setDiseaseInfo(diseaseInfoData);
            setDiseaseData(diseaseInfoData);
          } catch (err) {
            console.error('Error fetching disease info:', err);
          }

          // Fetch all symptoms for this disease
          const symptomsData = await getDiseaseHpos(diseaseData.name, predictionId);

          // Build a matched HPO ID set from multiple sources
          const matchedSet = new Set<string>();
          const reg = getMatchedHpoIds(predictionId, diseaseData.name);
          if (reg) {
            reg.forEach(id => matchedSet.add(normalizeHpoId(id)));
          }
          if (diseaseData.hpoDetails) {
            diseaseData.hpoDetails
              .filter(h => h.matched)
              .forEach(h => matchedSet.add(normalizeHpoId(h.hpo_id)));
          }
          if (diseaseData.matchingHpoIds) {
            diseaseData.matchingHpoIds.split(',')
              .map(s => s.trim())
              .filter(Boolean)
              .forEach(id => matchedSet.add(normalizeHpoId(id)));
          }
          // Apply matches client-side as a fallback/merge
          const merged: DiseaseHpoResponse = {
            ...symptomsData,
            symptoms: (symptomsData.symptoms || []).map(s => ({
              ...s,
              matched: s.matched || matchedSet.has(normalizeHpoId(s.hpo_id))
            })),
            matched_symptoms: (symptomsData.symptoms || []).filter(s => s.matched || matchedSet.has(normalizeHpoId(s.hpo_id))).length
          };
          setSymptoms(merged);
        } else {
          // Fallback to finding by ID in mock data
          if (diseaseId) {
            const foundDisease = mockDiseases.find(d => d.id === diseaseId);
            if (foundDisease) {
              setDisease({
                ...foundDisease,
                hpoDetails: foundDisease.hpoDetails || []
              });

              // Fetch all symptoms for this disease
              const symptomsData = await getDiseaseHpos(foundDisease.name, predictionId);
              const matchedSet = new Set<string>();
              const reg = getMatchedHpoIds(predictionId, foundDisease.name);
              if (reg) reg.forEach(id => matchedSet.add(normalizeHpoId(id)));
              if (foundDisease.hpoDetails) {
                foundDisease.hpoDetails.filter(h => h.matched).forEach(h => matchedSet.add(normalizeHpoId(h.hpo_id)));
              }
              if (foundDisease.matchingHpoIds) {
                foundDisease.matchingHpoIds.split(',')
                  .map(s => s.trim())
                  .filter(Boolean)
                  .forEach(id => matchedSet.add(normalizeHpoId(id)));
              }
              const merged: DiseaseHpoResponse = {
                ...symptomsData,
                symptoms: (symptomsData.symptoms || []).map(s => ({
                  ...s,
                  matched: s.matched || matchedSet.has(normalizeHpoId(s.hpo_id))
                })),
                matched_symptoms: (symptomsData.symptoms || []).filter(s => s.matched || matchedSet.has(normalizeHpoId(s.hpo_id))).length
              };
              setSymptoms(merged);
            } else {
              setError('Disease data not found');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching disease details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load disease details');
      } finally {
        setLoading(false);
      }
    };

    fetchDiseaseData();
  }, [diseaseId, location.state]);

  if (loading && !diseaseInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#DFDAE4]]"></div>
      </div>
    );
  }

  if (error || !disease) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-[#DFDAE4]600 hover:text-[#DFDAE4]800 mb-4 hover:bg-white hover:text-black"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to results
        </button>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Disease not found'}
        </div>
      </div>
    );
  }

  const sections: Section[] = [
    {
      id: 'overview',
      title: 'Overview',
      icon: <LayoutDashboard size={18} />
    },
    {
      id: 'symptoms',
      title: 'Symptoms',
      icon: <Activity size={18} />
    },
    {
      id: 'diagnosis',
      title: 'Diagnosis',
      icon: <Stethoscope size={18} />
    },
    {
      id: 'treatment',
      title: 'Treatment',
      icon: <HeartPulse size={18} />
    },
    {
      id: 'genetics',
      title: 'Genetics',
      icon: <Dna size={18} />
    },
    {
      id: 'counseling',
      title: 'Counseling',
      icon: <Users size={18} />
    },
    {
      id: 'resources',
      title: 'Resources',
      icon: <BookOpen size={18} />
    },
  ];

  const renderSectionContent = () => {


    const dataToRender = diseaseData || diseaseInfo;

    if (loading) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Loading Information...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Gathering disease information...</p>
          </CardContent>
        </Card>
      );
    }

    if (!dataToRender) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Information Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No detailed information is available for this disease.</p>
          </CardContent>
        </Card>
      );
    }

    const renderField = <K extends keyof DiseaseInfoResponse>(
      key: K,
      label: string,
      customValue?: DiseaseInfoResponse[K] | string | null
    ) => {
      const value = customValue !== undefined ? customValue : dataToRender[key];
      if (value === undefined || value === null || value === '') return null;
      if (Array.isArray(value) && value.length === 0) return null;

      let displayValue: string | string[] = '';
      if (Array.isArray(value)) {
        displayValue = value.map(item =>
          typeof item === 'object' ? JSON.stringify(item) : String(item)
        );
      } else if (typeof value === 'object') {
        displayValue = JSON.stringify(value, null, 2);
      } else {
        displayValue = String(value);
      }

      const renderMarkdown = (content: string | string[]) => {
        const contentStr = Array.isArray(content) ? content.join('\n') : content;

        return (
          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-foreground/90">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: (props) => <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground" {...props} />,
                h2: (props) => <h2 className="text-xl font-semibold mt-5 mb-3 text-foreground" {...props} />,
                h3: (props) => <h3 className="text-lg font-medium mt-4 mb-2 text-foreground" {...props} />,
                p: (props) => <p className="my-3 leading-relaxed text-foreground/90" {...props} />,
                ul: (props) => <ul className="list-disc pl-6 my-3 space-y-1.5" {...props} />,
                ol: (props) => <ol className="list-decimal pl-6 my-3 space-y-1.5" {...props} />,
                li: (props) => <li className="my-1.5 pl-1.5" {...props} />,
                a: (props) => (
                  <a
                    className="text-[#DFDAE4]600 dark:text-[#DFDAE4]400 hover:underline underline-offset-4 decoration-2 decoration-[#DFDAE4]300 dark:decoration-[#DFDAE4]600/50 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  />
                ),
                strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
                em: (props) => <em className="italic text-foreground/90" {...props} />,
                blockquote: (props) => (
                  <blockquote
                    className="border-l-4 border-[#DFDAE4]] pl-4 py-1 my-4 bg-[#DFDAE4]50/50 dark:bg-[#DFDAE4]900/10 italic text-foreground/80"
                    {...props}
                  />
                ),
                code: ({ node, className, children, ...props }) => {
                  const isInline = !className;
                  if (isInline) {
                    return <code className="px-1.5 py-0.5 rounded bg-muted text-foreground/90 text-sm font-mono" {...props}>{children}</code>;
                  }
                  return (
                    <pre className="bg-muted p-4 rounded-lg my-4 overflow-x-auto">
                      <code className="text-sm font-mono leading-relaxed" {...props}>{children}</code>
                    </pre>
                  );
                },
                table: (props) => (
                  <div className="my-4 border rounded-lg overflow-hidden">
                    <table className="w-full border-collapse" {...props} />
                  </div>
                ),
                th: (props) => (
                  <th
                    className="px-4 py-2 text-left bg-muted/50 border-b border-border font-semibold text-foreground"
                    {...props}
                  />
                ),
                td: (props) => (
                  <td
                    className="px-4 py-2 border-b border-border text-foreground/90"
                    {...props}
                  />
                ),
                tr: (props) => (
                  <tr
                    className="hover:bg-muted/30 transition-colors"
                    {...props}
                  />
                ),
              }}
            >
              {contentStr}
            </ReactMarkdown>
          </div>
        );
      };

      return (
        <div key={key} className="mb-8 last:mb-0 group">
          <h3 className="font-jakarta font-semibold text-foreground mb-3 text-lg border-b border-border/50 pb-1.5 group-first:mt-0 mt-6">
            {label}
          </h3>
          {Array.isArray(displayValue) ? (
            <ul className="space-y-2">
              {displayValue.map((item, index) => (
                <li key={index} className="pl-2 border-l-2 border-muted-foreground/20">
                  {renderMarkdown(item)}
                </li>
              ))}
            </ul>
          ) : (
            renderMarkdown(displayValue)
          )}
        </div>
      );
    };

    switch (activeSection) {
      case 'overview':
        return (
          <Card>
            <CardHeader>
              <CardTitle>{dataToRender.disease_name || 'Disease Overview'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderField('prevalence', 'Prevalence')}
              {renderField('age_of_onset', 'Age of Onset')}
              {renderField('disease_category', 'Disease Category')}
              {renderField('clinical_description', 'Clinical Description')}
            </CardContent>
          </Card>
        );

      case 'symptoms':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Symptom Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={symptomQuery}
                  onChange={(e) => setSymptomQuery(e.target.value)}
                  placeholder="Search symptoms..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-4">
                {symptoms?.symptoms && symptoms.symptoms.length > 0 ? (
                  [...symptoms.symptoms]
                    .filter(s =>
                      symptomQuery.trim().length === 0
                        ? true
                        : s.hpo_name.toLowerCase().includes(symptomQuery.toLowerCase())
                    )
                    .sort((a, b) => (b.matched ? 1 : 0) - (a.matched ? 1 : 0))
                    .map((symptom) => {
                      const urlParams = new URLSearchParams(window.location.search);
                      const predictionId = urlParams.get('uuid');

                      const hpoDetail = disease?.hpoDetails?.find(hpo => hpo.hpo_id === symptom.hpo_id);

                      return (
                        <div key={symptom.hpo_id} className="w-full">
                          <SymptomProfile
                            symptom={{
                              hpo_id: symptom.hpo_id,
                              hpo_name: symptom.hpo_name,
                              matched: symptom.matched || false,
                              connected_nodes: hpoDetail?.connected_nodes || [],
                              connected_hpos: hpoDetail?.connected_hpos || []
                            }}
                            predictionId={predictionId || undefined}
                            showConnections={true}
                            className="w-full"
                          />
                        </div>
                      );
                    })
                ) : (
                  <p className="text-sm text-muted-foreground">No symptom data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'diagnosis':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Diagnosis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderField('diagnostic_methods', 'Diagnostic Methods')}
              {renderField('tests_order', 'Recommended Tests')}
              {renderField('clinical_description', 'Clinical Presentation')}
            </CardContent>
          </Card>
        );

      case 'treatment':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Treatment & Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderField('indication_drugs', 'Indicated Drugs')}
              {renderField('contraindication_drugs', 'Contraindicated Drugs')}
              {renderField('off_label_use', 'Off-Label Use')}
              {renderField('prognosis', 'Prognosis')}
            </CardContent>
          </Card>
        );

      case 'genetics':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Genetic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderField('inheritance', 'Inheritance Pattern')}
              {renderField('protein_name', 'Protein')}
              {renderField('mutation', 'Mutation')}
              {renderField('mutation_type', 'Mutation Type')}
              {renderField('mutation_location', 'Genomic Location')}
              {renderField('reference_genome', 'Reference Genome')}
            </CardContent>
          </Card>
        );

      case 'counseling':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Genetic Counseling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderField('genetic_counseling', 'Counseling Considerations')}
              {renderField('antenatal_diagnosis', 'Prenatal Testing')}
              {renderField('exposure', 'Environmental Factors')}
            </CardContent>
          </Card>
        );

      case 'resources':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderField('source', 'References')}
              {diseaseInfo.orpha_id && (
                <div className="mt-4">
                  <h3 className="font-medium text-foreground mb-2">External Links</h3>
                  <div className="space-y-2">
                    <a
                      href={`https://www.orpha.net/consor/cgi-bin/OC_Exp.php?lng=EN&Expert=${diseaseInfo.orpha_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Orphanet Disease Page
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>{sections.find(s => s.id === activeSection)?.title || 'Section'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No information available for this section.</p>
            </CardContent>
          </Card>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#DFDAE4]]"></div>
      </div>
    );
  }

  if (error || !disease) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2 mb-4 hover:bg-white hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Results
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              {error || 'Disease not found'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header */}
      <header className="bg-background border-b shadow-sm fixed top-0 z-40 w-full">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2 hover:bg-white hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Results
            </Button>
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="font-jakarta text-3xl font-bold text-foreground">{disease?.name}</h1>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2">
              {/* {disease?.confidence && (
                <Badge
                  className={`bg-${disease.confidence >= 80 ? 'success' : disease.confidence >= 60 ? 'accent' : 'secondary'} text-${disease.confidence >= 80 ? 'success' : disease.confidence >= 60 ? 'accent' : 'secondary'}-foreground`}
                  variant="secondary"
                >
                  {disease.confidence}% Match
                </Badge>
              )} */}
              {symptoms?.symptoms && (
                <div className="flex flex-col items-end">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-foreground">
                      {symptoms.symptoms.filter(s => s.matched).length}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-lg text-muted-foreground">
                      {symptoms.symptoms.length}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground text-right leading-tight mt-0.5">
                    symptom from symptom profile matched
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="flex flex-col md:flex-row gap-6 relative">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="fixed top-24 h-[calc(100vh-6rem)] w-[calc(16rem-2rem)]">
              <Card className="rounded-lg border border-black-200 bg-white shadow-sm">
                <CardHeader className="p-4 pb-2 mt-20">
                  <h2 className="text-lg font-semibold text-black-900">Disease Information</h2>
                  <p className="text-sm text-black-500">Explore detailed information</p>
                </CardHeader>
                <ScrollArea className="h-[calc(100vh-16rem)]">
                  <div className="p-2">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeSection === section.id
                          ? 'bg-[#E3CDC1] text-black font-medium'
                          : 'text-black-700 hover:bg-black-50'
                          }`}
                      >
                        <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${activeSection === section.id
                          ? 'bg-[#DFDAE4]100 text-[#DFDAE4]600'
                          : 'bg-black-100 text-black-500'
                          }`}>
                          {section.icon}
                        </span>
                        <span className="text-sm">{section.title}</span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {renderSectionContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DiseaseDetails;