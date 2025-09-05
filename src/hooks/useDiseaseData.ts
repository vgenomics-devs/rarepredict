import { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Disease, HpoDetail, DiseaseHpoResponse, getDiseaseHpos, getMatchedHpoIds, loginAndGetToken, getDiseaseInfo, DiseaseInfoResponse } from '@/lib/mockApi';

interface ExtendedDisease extends Disease {
  hpoDetails?: HpoDetail[];
}

interface DiseaseDataState {
  disease: ExtendedDisease | null;
  symptoms: DiseaseHpoResponse | null;
  diseaseInfo: DiseaseInfoResponse | null;
  loading: boolean;
  loadingDiseaseInfo: boolean;
  error: string | null;
  diseaseInfoError: string | null;
}

export const useDiseaseData = (predictionId: string | null) => {
  const { diseaseId } = useParams<{ diseaseId: string }>();
  const location = useLocation();
  const [hasFetchedDiseaseInfo, setHasFetchedDiseaseInfo] = useState(false);
  const [state, setState] = useState<DiseaseDataState>({
    disease: null,
    symptoms: null,
    diseaseInfo: null,
    loading: true,
    loadingDiseaseInfo: false,
    error: null,
    diseaseInfoError: null,
  });

  const normalizeHpoId = useCallback((id: string) => {
    if (!id) return id;
    const t = id.trim().toUpperCase();
    return t.startsWith('HP:') ? t : `HP:${t.replace('HP', '')}`;
  }, []);

  const updateState = useCallback((updates: Partial<DiseaseDataState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const fetchDiseaseInfo = useCallback(async (diseaseName: string) => {
    if (!diseaseName || hasFetchedDiseaseInfo) return;
    
    try {
      updateState({ 
        loadingDiseaseInfo: true, 
        diseaseInfoError: null 
      });
      
      const token = await loginAndGetToken();
      const response = await getDiseaseInfo(diseaseName, token);
      
      const info = Array.isArray(response) ? response[0] : response;
      
      if (!info.disease_name && info.name) {
        info.disease_name = info.name;
      }
      
      updateState({
        diseaseInfo: info,
        loadingDiseaseInfo: false
      });
      
      setHasFetchedDiseaseInfo(true);
    } catch (error) {
      console.error('Error fetching disease info:', error);
      updateState({
        diseaseInfoError: 'Failed to load disease information. Please try again.',
        loadingDiseaseInfo: false
      });
    }
  }, [hasFetchedDiseaseInfo, updateState]);

  const fetchDiseaseData = useCallback(async () => {
    if (!predictionId) {
      updateState({ 
        error: 'Prediction ID (UUID) is required',
        loading: false 
      });
      return;
    }

    try {
      updateState({ loading: true, error: null });
      
      // Get disease data from location state or find by ID
      const diseaseData = location.state?.disease;
      
      if (diseaseData) {
        updateState({ disease: diseaseData });
        
        // Fetch symptoms for this disease
        const symptomsData = await getDiseaseHpos(diseaseData.name, predictionId);
        const matchedSet = new Set<string>();
        
        // Add matched HPO IDs from various sources
        const reg = getMatchedHpoIds(predictionId, diseaseData.name);
        if (reg) reg.forEach(id => matchedSet.add(normalizeHpoId(id)));
        
        if (diseaseData.hpoDetails) {
          diseaseData.hpoDetails
            .filter(h => h.matched)
            .forEach(h => matchedSet.add(normalizeHpoId(h.hpo_id)));
        }
        
        if (diseaseData.matchingHpoIds) {
          diseaseData.matchingHpoIds
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
            .forEach(id => matchedSet.add(normalizeHpoId(id)));
        }
        
        // Merge symptoms data with matched status
        const merged: DiseaseHpoResponse = {
          ...symptomsData,
          symptoms: (symptomsData.symptoms || []).map(s => ({
            ...s,
            matched: s.matched || matchedSet.has(normalizeHpoId(s.hpo_id))
          })),
          matched_symptoms: (symptomsData.symptoms || []).filter(s => 
            s.matched || matchedSet.has(normalizeHpoId(s.hpo_id))
          ).length
        };
        
        updateState({
          symptoms: merged,
          loading: false
        });
        
        // Fetch disease info if not already done
        if (!hasFetchedDiseaseInfo) {
          await fetchDiseaseInfo(diseaseData.name);
        }
      } else if (diseaseId) {
        // Fallback to finding by ID in mock data
        // This part should be moved to a separate function or service
        // For now, we'll keep it simple
        updateState({
          error: 'Disease data not found in location state',
          loading: false
        });
      }
    } catch (err) {
      console.error('Error fetching disease details:', err);
      updateState({
        error: err instanceof Error ? err.message : 'Failed to load disease details',
        loading: false
      });
    }
  }, [predictionId, location.state, diseaseId, normalizeHpoId, hasFetchedDiseaseInfo, fetchDiseaseInfo, updateState]);

  useEffect(() => {
    fetchDiseaseData();
  }, [fetchDiseaseData]);

  return {
    ...state,
    refetchDiseaseData: fetchDiseaseData,
    refetchDiseaseInfo: (diseaseName: string) => fetchDiseaseInfo(diseaseName)
  };
};
