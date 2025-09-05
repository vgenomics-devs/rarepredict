import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import type { Symptom } from '@/components/SymptomSelector';
import { cn } from '@/lib/utils';

interface HpoTerm {
  hpo_id: string;
  hpo_name: string;
  relation?: string;
  score?: number;
}

interface HpoApiResponse {
  related_terms: HpoTerm[];
}

type ConnectedNode = HpoTerm;

interface SymptomProfileProps {
  symptom: {
    hpo_id: string;
    hpo_name: string;
    matched: boolean;
    connected_nodes?: ConnectedNode[];
    connected_hpos?: Array<{
      hpo_id: string;
      hpo_name: string;
      relation?: string;
    }>;
  };
  className?: string;
  showConnections?: boolean;
  predictionId?: string;
}

export const SymptomProfile: React.FC<SymptomProfileProps> = ({
  symptom,
  className = '',
  showConnections = true,
  predictionId
}) => {

  const [isExpanded, setIsExpanded] = useState(false);
  const [connectedNodes, setConnectedNodes] = useState<ConnectedNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper: normalize HPO ID for comparisons
  const normalizeHpoId = (id: string) => {
    if (!id) return id;
    const t = id.trim().toUpperCase();
    return t.startsWith('HP:') ? t : `HP:${t.replace(/^HP/, '')}`;
  };

  // State for storing fetched HPO term details
  const [hpoDetails, setHpoDetails] = useState<{ [key: string]: Symptom }>({});

  // Get HPO term info from the global window.allSymptoms
  const getSymptomInfo = (hpoId: string): Symptom | null => {
    if (!hpoId) return null;

    const normId = normalizeHpoId(hpoId);

    // Return from cache if available
    if (hpoDetails[normId]) {
      return hpoDetails[normId];
    }

    // Try to find in window.allSymptoms
    if (window.allSymptoms) {
      const found = window.allSymptoms.find(s => {
        const symptomHpoId = s.hpoid || '';
        return normalizeHpoId(symptomHpoId) === normId;
      });

      if (found) {
        const term: Symptom = {
          symptomguid: found.symptomguid || normId,
          name: found.name || normId,
          hpoid: normId,
          definition: found.definition || '',
          synonyms: found.synonyms || [],
          xrefs: found.xrefs || []
        };

        setHpoDetails(prev => ({
          ...prev,
          [normId]: term
        }));

        return term;
      }
    }

    // If not found, check localStorage for cached symptoms
    const storedSymptoms = localStorage.getItem('allSymptoms');
    if (storedSymptoms) {
      try {
        const parsedSymptoms: Symptom[] = JSON.parse(storedSymptoms);
        const found = parsedSymptoms.find(s => {
          const symptomHpoId = s.hpoid || '';
          return normalizeHpoId(symptomHpoId) === normId;
        });

        if (found) {
          const term: Symptom = {
            symptomguid: found.symptomguid || normId,
            name: found.name || normId,
            hpoid: normId,
            definition: found.definition || '',
            synonyms: found.synonyms || [],
            xrefs: found.xrefs || []
          };

          setHpoDetails(prev => ({
            ...prev,
            [normId]: term
          }));

          return term;
        }
      } catch (e) {
        console.error('Error parsing stored symptoms:', e);
      }
    }

    // If still not found, return a basic term
    const basicTerm: Symptom = {
      symptomguid: normId,
      name: normId,
      hpoid: normId,
      definition: '',
      synonyms: [],
      xrefs: []
    };

    // Don't cache the basic term to allow retries
    return basicTerm;
  };

  const info = getSymptomInfo(symptom.hpo_id);

  // Fetch connected nodes from HPO API if not provided
  useEffect(() => {
    const fetchConnectedNodes = async () => {
      // Skip if we already have connections or if we shouldn't show connections
      if (!showConnections || !predictionId) return;

      // If we already have connections from props, use those
      if (symptom.connected_nodes?.length || symptom.connected_hpos?.length) {
        const nodes: ConnectedNode[] = [];

        if (Array.isArray(symptom.connected_nodes)) {
          nodes.push(...symptom.connected_nodes);
        } else if (Array.isArray(symptom.connected_hpos)) {
          nodes.push(...symptom.connected_hpos.map(hpo => ({
            ...hpo,
            relation: hpo.relation || 'related',
            score: undefined
          })));
        }

        setConnectedNodes(nodes);
        return;
      }

      // Otherwise, fetch from HPO API
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `http://localhost:5000/hpo/related?hpo_id=${symptom.hpo_id}&uuid=${predictionId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch related HPO terms');
        }

        const data = await response.json() as HpoApiResponse;

        if (data.related_terms) {
          const nodes: ConnectedNode[] = data.related_terms.map(term => ({
            hpo_id: term.hpo_id,
            hpo_name: term.hpo_name,
            relation: term.relation || 'related',
            score: term.score
          }));
          setConnectedNodes(nodes);
        }
      } catch (err) {
        console.error('Error fetching related HPO terms:', err);
        setError('Failed to load related terms');
      } finally {
        setIsLoading(false);
      }
    };

    if (isExpanded && showConnections) {
      fetchConnectedNodes();
    }
  }, [symptom, isExpanded, showConnections, predictionId]);

  const hasConnections = showConnections && (connectedNodes.length > 0 || isLoading);
  const toggleExpand = () => setIsExpanded(!isExpanded);

  // If not showing connections or no connections available, show basic symptom info
  if (!showConnections || (!isLoading && connectedNodes.length === 0)) {
    const handleTooltipOpen = () => {
      if (!info) {
        // fetchHpoDetails(symptom.hpo_id);
      }
    };

    // Check if we have the full symptom info
    const hasFullInfo = info && (info.definition || (info.synonyms && info.synonyms.length > 0) || (info.xrefs && info.xrefs.length > 0));

    return (
      <div className={cn("p-4 rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
        <div className="flex items-center justify-between">
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <h3 className="font-medium">{symptom.hpo_name}</h3>
                    <p className="text-sm text-muted-foreground font-mono">
                      <a
                        href={`https://hpo.jax.org/app/browse/term/${normalizeHpoId(symptom.hpo_id)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline-offset-2 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {symptom.hpo_id}
                      </a>
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  className="max-w-sm min-w-[300px] p-4"
                  side="right"
                  sideOffset={5}
                  onPointerDownOutside={(e) => e.preventDefault()}
                >
                  {!info ? (
                    <div className="flex items-center gap-2 p-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm">Loading term details...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {info.definition ? (
                        <p className="text-sm leading-relaxed text-foreground">
                          {info.definition}
                        </p>
                      ) : hasFullInfo ? null : (
                        <p className="text-sm text-muted-foreground italic">
                          No definition available for this term.
                        </p>
                      )}

                      {info.synonyms && info.synonyms.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs font-medium mb-1 text-muted-foreground">Also known as</div>
                          <div className="flex flex-wrap gap-1.5">
                            {info.synonyms.slice(0, 5).map((s, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-full bg-muted/50 text-foreground/90 text-xs"
                              >
                                {s}
                              </span>
                            ))}
                            {info.synonyms.length > 5 && (
                              <span className="text-xs text-muted-foreground self-center">
                                +{info.synonyms.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-border">
                        <a
                          href={`https://hpo.jax.org/app/browse/term/${normalizeHpoId(symptom.hpo_id)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View full details on HPO website
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="inline"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                        </a>
                      </div>
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Badge variant={symptom.matched ? 'default' : 'secondary'} className="ml-2">
            {symptom.matched ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Matched
              </>
            ) : (
              <>
                <X className="h-3 w-3 mr-1" />
                Not Matched
              </>
            )}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border shadow-sm overflow-hidden",
      symptom.matched ? 'border-green-200 bg-green-50' : 'border-border bg-card'
    )}>
      <div className="p-4 border-b flex items-center justify-between cursor-pointer" onClick={toggleExpand}>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className={cn("font-medium cursor-help", symptom.matched ? 'text-green-800' : 'text-foreground')}>
                    {symptom.hpo_name}
                  </h3>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  {info ? (
                    <div className="space-y-2">
                      {info.definition && (
                        <p className="text-sm leading-snug">{info.definition}</p>
                      )}
                      {info.synonyms && info.synonyms.length > 0 && (
                        <div>
                          <div className="text-xs font-medium mb-1">Synonyms</div>
                          <div className="flex flex-wrap gap-1">
                            {info.synonyms.slice(0, 6).map((s, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-muted text-foreground text-xs">{s}</span>
                            ))}
                            {info.synonyms.length > 6 && (
                              <span className="text-xs opacity-70">+{info.synonyms.length - 6} more…</span>
                            )}
                          </div>
                        </div>
                      )}
                      {info.xrefs && info.xrefs.length > 0 && (
                        <div>
                          <div className="text-xs font-medium mb-1">Cross-refs</div>
                          <div className="flex flex-wrap gap-1">
                            {info.xrefs.slice(0, 6).map((x, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-muted text-foreground text-xs font-mono">{x}</span>
                            ))}
                            {info.xrefs.length > 6 && (
                              <span className="text-xs opacity-70">+{info.xrefs.length - 6} more…</span>
                            )}
                          </div>
                        </div>
                      )}
                      {!info.definition && (!info.synonyms || info.synonyms.length === 0) && (!info.xrefs || info.xrefs.length === 0) && (
                        <div className="text-xs text-muted-foreground">No additional details available.</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">No additional details available.</div>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Badge
              variant={symptom.matched ? 'default' : 'secondary'}
              className={cn("ml-2", symptom.matched ? 'bg-green-100 text-green-800 hover:bg-green-100' : '')}
            >
              {symptom.matched ? (
                <>
                  <Check className="h-3 w-3 mr-1 text-green-600" />
                  Matched
                </>
              ) : (
                'Not Matched'
              )}
            </Badge>
          </div>
          <p className={cn("text-sm font-mono mt-1",
            symptom.matched ? 'text-green-600' : 'text-muted-foreground'
          )}>
            <a
              href={`https://hpo.jax.org/app/browse/term/${normalizeHpoId(symptom.hpo_id)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 hover:underline"
            >
              {symptom.hpo_id}
            </a>
          </p>
          <div className="mt-2 flex items-center text-sm text-muted-foreground">
            <span>{connectedNodes.length} connected term{connectedNodes.length !== 1 ? 's' : ''}</span>
            <span className="mx-2">•</span>
            <span className="text-primary font-medium">
              {isExpanded ? 'Hide details' : 'Show details'}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 ml-1 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-1 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 bg-muted/20">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[120px]">HPO ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[120px]">Relation</TableHead>
                  <TableHead className="w-[80px] text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {connectedNodes.map((node, index) => (
                  <TableRow key={`${node.hpo_id}-${index}`} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">
                      <span className="bg-muted px-2 py-1 rounded">
                        {node.hpo_id}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{node.hpo_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {node.relation || 'related'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {typeof node.score === 'number' ? (
                        <span className="font-mono">{node.score.toFixed(2)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomProfile;
