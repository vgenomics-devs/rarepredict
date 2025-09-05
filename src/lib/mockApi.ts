// API for rare disease prediction
export interface HpoDetail {
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

export interface Disease {
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
  hpoDetails?: HpoDetail[]; // Add HPO details to the Disease interface
  rdxScore?: number; // Captured from graphpredict RDX_Score
}

// Fallback mock data in case API call fails
export const mockDiseases: Disease[] = [
  {
    id: "1",
    name: "Ehlers-Danlos Syndrome",
    confidence: 78,
    matchPercentage: "78%",
    matchedNodes: "3/28",
    matchingHpoIds: "3/3",
    rank: 1,
    weight: 2.2,
    description: "A group of inherited disorders that affect connective tissues, primarily the skin, joints, and blood vessel walls.",
    symptoms: ["Joint pain", "Skin discoloration", "Fatigue", "Muscle pain", "Weakness"],
    prevalence: "1 in 2,500 to 1 in 5,000 people worldwide",
    links: [
      { title: "Mayo Clinic - Ehlers-Danlos Syndrome", url: "https://www.mayoclinic.org/diseases-conditions/ehlers-danlos-syndrome" },
      { title: "National Organization for Rare Disorders", url: "https://rarediseases.org/rare-diseases/ehlers-danlos-syndrome/" }
    ]
  },
  {
    id: "2",
    name: "Fibromyalgia",
    confidence: 72,
    matchPercentage: "72%",
    matchedNodes: "2/15",
    matchingHpoIds: "2/2",
    rank: 2,
    weight: 1.8,
    description: "A disorder characterized by widespread musculoskeletal pain accompanied by fatigue, sleep, memory, and mood issues.",
    symptoms: ["Muscle pain", "Fatigue", "Sleep problems", "Memory loss", "Joint pain"],
    prevalence: "2-4% of the population, more common in women",
    links: [
      { title: "Mayo Clinic - Fibromyalgia", url: "https://www.mayoclinic.org/diseases-conditions/fibromyalgia" },
      { title: "National Fibromyalgia Association", url: "https://www.fmaware.org/" }
    ]
  },
];

// Interface for HPO detail in API response
export interface HpoApiDetail {
  hpo_id: string;
  hpo_name: string;
  matched: boolean;
}

// Interface for disease in API response
export interface ApiDisease {
  Disease: string;
  'Match_Percentage': string;
  'Matched/Total_Nodes': string;
  'Matching_HPO_IDs': string;
  'RDX_Score'?: string | number;
  Rank: number;
  Weight: number | string;
  description?: string;
  symptoms?: string[];
  prevalence?: string;
  resources?: Array<{ title?: string; url?: string }>;
  HPO_Details?: HpoApiDetail[];
  hpoDetails?: Array<{
    hpo_id: string;
    hpo_name: string;
    matched: boolean;
  }>;
  matchPercentage?: string;
}

// Interface for API response data
export interface ApiResponse {
  predictions?: Array<{
    Disease: string;
    'Match_Percentage': string;
    'Matched/Total_Nodes': string;
    'Matching_HPO_IDs': string;
    'RDX_Score'?: string | number;
    Rank: number;
    Weight: number | string;
    description?: string;
    symptoms?: string[];
    prevalence?: string;
    resources?: Array<{ title?: string; url?: string }>;
    HPO_Details?: HpoApiDetail[];
    hpoDetails?: Array<{
      hpo_id: string;
      hpo_name: string;
      matched: boolean;
    }>;
    matchPercentage?: string;
  }>;
  diseases?: ApiDisease[];
  [key: string]: unknown;
}

// Interface for API request
interface PredictionRequest {
  hpo_ids: string[];
  age: number;
}

// Import the Symptom type to ensure type safety
import { Symptom } from "@/components/SymptomSelector";
import { v4 as uuidv4 } from 'uuid';

// Registry to persist matched HPO IDs from graphpredict API
// Keyed by `${predictionId}::${diseaseName}` so we can retrieve later in getDiseaseHpos()
const matchedHpoRegistry: Map<string, Set<string>> = new Map();

function normalizeHpoId(id: string): string {
  if (!id) return id;
  const trimmed = id.trim().toUpperCase();
  return trimmed.startsWith('HP:') ? trimmed : `HP:${trimmed.replace(/^HP/, '')}`;
}

function normalizeDiseaseName(name: string): string {
  return (name || '').trim().toLowerCase();
}

function makeRegistryKey(predictionId: string, diseaseName: string) {
  return `${predictionId}::${normalizeDiseaseName(diseaseName)}`;
}

export function setMatchedHpoIds(predictionId: string, diseaseName: string, ids: string[]) {
  const norm = ids.map(normalizeHpoId);
  const key = makeRegistryKey(predictionId, diseaseName);
  matchedHpoRegistry.set(key, new Set(norm));
}

export function getMatchedHpoIds(predictionId: string, diseaseName: string): Set<string> | undefined {
  const key = makeRegistryKey(predictionId, diseaseName);
  return matchedHpoRegistry.get(key);
}

declare global {
  interface Window {
    allSymptoms: Symptom[];
  }
}

/**
 * Extracts HPO IDs from the selected symptoms
 * @param symptoms Array of symptom names or objects with id and name
 * @returns Array of HPO IDs
 */
const extractHpoIds = (symptoms: Array<string | { id: string; name: string }>): string[] => {
  try {

    // If we already have objects with IDs, just extract the IDs
    if (symptoms.length > 0 && typeof symptoms[0] === 'object' && 'id' in symptoms[0]) {
      const hpoIds = (symptoms as Array<{ id: string; name: string }>)
        .map(s => s.id)
        .filter((id): id is string => !!id);
      console.groupEnd();
      return hpoIds;
    }

    // Fallback to the original behavior for string inputs
    const symptomNames = symptoms as string[];

    // Get the symptom data from the global window object where it's stored by the SymptomSelector
    const allSymptoms: Symptom[] = window.allSymptoms || [];



    const hpoIds = symptomNames.map(symptomName => {

      // Find the symptom in the full list (case-insensitive match)
      const symptom = allSymptoms.find(s => {
        const nameMatch = s.name?.toLowerCase() === symptomName?.toLowerCase();
        const synonymMatch = s.synonyms?.some(syn => syn?.toLowerCase() === symptomName?.toLowerCase());
        return nameMatch || synonymMatch;
      });

      if (symptom) {
        return symptom.hpoid;
      } else {
        return null;
      }
    }).filter((hpoId): hpoId is string => hpoId !== null);

    console.groupEnd();
    return hpoIds;
  } catch (error) {
    console.error('Error extracting HPO IDs:', error);
    return [];
  }
};

// Update the return type to include UUID
type PredictionResult = {
  diseases: Disease[];
  predictionId: string;
};

/**
 * Predicts rare diseases based on symptoms and age using the graph prediction API
 * @param symptoms Array of symptom names or objects with id and name that were selected
 * @param age The age of the patient
 * @returns Promise that resolves to an object containing diseases and prediction ID
 */
export const predictRareDiseases = async (
  symptoms: Array<string | { id: string; name: string }>,
  age: number
): Promise<PredictionResult> => {
  try {

    // Extract HPO IDs from the selected symptoms
    const hpoIds = extractHpoIds(symptoms);

    if (hpoIds.length === 0) {
      console.warn('No valid HPO IDs found for the selected symptoms');
      return { diseases: [], predictionId: '' };
    }


    // Generate a unique ID for this prediction request
    const predictionId = uuidv4();

    // Call the prediction endpoint
    const response = await fetch('http://34.93.204.92:8081/graphpredict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hpo_ids: hpoIds,
        age: age,
        uuid: predictionId
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Prediction API error:', error);
      throw new Error(error.message || 'Failed to get predictions');
    }

    const data: ApiResponse = await response.json();

    // Process the response to include HPO details in each disease
    if (data.predictions && Array.isArray(data.predictions)) {
      data.predictions.forEach(disease => {
        // Check if we have HPO_Details in the prediction
        if (disease.HPO_Details && Array.isArray(disease.HPO_Details)) {

          // Map HPO_Details to hpoDetails format
          disease.hpoDetails = disease.HPO_Details.map(hpo => ({
            hpo_id: hpo.hpo_id,
            hpo_name: hpo.hpo_name,
            matched: hpo.matched
          }));

          // Calculate matched and total counts
          const matchedCount = disease.hpoDetails.filter(hpo => hpo.matched).length;
          const totalCount = disease.hpoDetails.length;

          // Update the disease object with calculated values
          disease['Matched/Total_Nodes'] = `${matchedCount}/${totalCount}`;
          disease.matchPercentage = totalCount > 0
            ? `${Math.round((matchedCount / totalCount) * 100)}%`
            : '0%';

        }
      });
    } else {
      console.warn('No predictions found in API response');
    }

    // Transform the API response to match our Disease interface and limit to top 20
    const diseases: Disease[] = (data.predictions || [])
      .slice(0, 20) // Limit to top 20 diseases
      .map((prediction: {
        Disease?: string;
        Match_Percentage?: string;
        'Matched/Total_Nodes'?: string;
        Matching_HPO_IDs?: string;
        Rank?: number;
        Weight?: number | string;
        description?: string;
        symptoms?: string[];
        prevalence?: string;
        resources?: Array<{ title?: string; url?: string }>;
        HPO_Details?: HpoDetail[];
        hpoDetails?: Array<{
          hpo_id: string;
          hpo_name: string;
          matched: boolean;
        }>;
        matchPercentage?: string;
        'RDX_Score'?: string | number;
      }, index: number) => {
        // Use the processed hpoDetails if available, otherwise fall back to HPO_Details
        const hpoDetails = prediction.hpoDetails ||
          (prediction.HPO_Details?.map(hpo => ({
            hpo_id: hpo.hpo_id,
            hpo_name: hpo.hpo_name,
            matched: hpo.matched
          })) || []);

        // Get matched HPO IDs for the matchingHpoIds string
        const matchedHpoIds = hpoDetails
          .filter(hpo => hpo.matched)
          .map(hpo => normalizeHpoId(hpo.hpo_id));

        // Calculate matched and total counts
        const matchedCount = matchedHpoIds.length;
        const totalCount = hpoDetails.length;

        // Persist matched HPO IDs in the registry for later lookup by disease details page
        if (predictionId && (prediction.Disease || '').length > 0) {
          try {
            setMatchedHpoIds(predictionId, prediction.Disease as string, matchedHpoIds);
          } catch (e) {
            console.warn('Unable to store matched HPO IDs in registry:', e);
          }
        }

        // Create the Disease object
        return {
          id: `disease-${index + 1}`,
          name: prediction.Disease || `Disease ${index + 1}`,
          confidence: parseFloat(prediction.Match_Percentage || '0') || 0,
          matchPercentage: prediction.matchPercentage || prediction.Match_Percentage || '0%',
          matchedNodes: prediction['Matched/Total_Nodes'] || `${matchedCount}/${totalCount}`,
          matchingHpoIds: matchedHpoIds.join(','),
          rank: prediction.Rank || index + 1,
          weight: typeof prediction.Weight === 'number' ? prediction.Weight : 0,
          description: prediction.description || `Description for ${prediction.Disease || `Disease ${index + 1}`}`,
          symptoms: prediction.symptoms || hpoDetails.map(hpo => hpo.hpo_name) || [],
          prevalence: prediction.prevalence || 'Unknown',
          links: prediction.resources?.map((r, i) => ({
            title: r.title || `Resource ${i + 1}`,
            url: r.url || '#'
          })) || [],
          hpoDetails: hpoDetails,
          rdxScore: typeof prediction['RDX_Score'] === 'string'
            ? parseFloat(prediction['RDX_Score'] as string)
            : (typeof prediction['RDX_Score'] === 'number' ? (prediction['RDX_Score'] as number) : undefined)
        };
      });

    return { diseases, predictionId };
  } catch (error) {
    console.error('Error in predictRareDiseases:', error);
    // Fall back to mock data in case of error
    console.warn('Falling back to mock data due to API error');
    return { diseases: mockDiseases, predictionId: `mock-${Date.now()}` };
  } finally {
    console.groupEnd();
  }
};

// Interface for HPO term in the API response
interface HpoTermResponse {
  hpo_id: string;
  hpo_name: string;
  matched?: boolean;
}

// Interface for disease HPO response
export interface DiseaseHpoResponse {
  disease_id: string;
  disease_name: string;
  symptoms: Array<{
    hpo_id: string;
    hpo_name: string;
    matched: boolean | null;
  }>;
  total_symptoms: number;
  matched_symptoms: number;
  connected_hpos?: HpoTermResponse[];
}

/**
 * Fetches all HPO terms for a disease with matched status
 * @param diseaseId The disease ID or name (will be URL-encoded)
 * @param predictionId Optional prediction UUID (required for the API call)
 * @returns Promise with disease HPO terms and their matched status
 */
export const getDiseaseHpos = async (
  diseaseId: string,
  predictionId?: string
): Promise<DiseaseHpoResponse> => {
  if (!predictionId) {
    throw new Error('Prediction ID (UUID) is required for fetching disease HPO terms');
  }

  try {
    // Encode the disease name for URL (replaces spaces with %20 and other special characters)
    const encodedDiseaseName = encodeURIComponent(diseaseId.trim());
    const apiUrl = `http://34.93.204.92:8081/disease/hpos?disease=${encodedDiseaseName}&uuid=${predictionId}`;


    // Make the API call
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('API Error:', error);
      throw new Error(error.message || 'Failed to fetch disease symptoms');
    }

    // Get the response data first
    const data = await response.json();

    // Lookup matched HPO IDs from registry using predictionId + disease name
    const matchedHpoIds = predictionId ? (getMatchedHpoIds(predictionId, diseaseId) || new Set<string>()) : new Set<string>();



    // Transform the API response to match our interface
    const hpoTerms = data.connected_hpos || data.symptoms || [];

    const symptoms = hpoTerms.map((hpo: HpoTermResponse) => {
      const isMatched = matchedHpoIds.has(normalizeHpoId(hpo.hpo_id)) || hpo.matched || false;

      return {
        hpo_id: hpo.hpo_id,
        hpo_name: hpo.hpo_name,
        matched: isMatched
      };
    });

    const matchedCount = symptoms.filter(s => s.matched).length;
    const result: DiseaseHpoResponse = {
      disease_id: data.disease_id || diseaseId,
      disease_name: data.disease_name || diseaseId,
      symptoms: symptoms,
      total_symptoms: data.total_symptoms || symptoms.length,
      matched_symptoms: data.matched_symptoms !== undefined ? data.matched_symptoms : matchedCount
    };

    return result;
  } catch (error) {
    console.error('Error in getDiseaseHpos:', error);
    throw new Error('Failed to fetch disease symptoms');
  } finally {
    console.groupEnd();
  }
};

// Interface for login response
interface LoginResponse {
  token: string;
  // Add other fields from the login response if needed
  [key: string]: unknown;
}

/**
 * Logs in to the API and retrieves an RDX token
 * @returns Promise that resolves to the authentication token
 */
export async function loginAndGetToken(): Promise<string> {
  try {
    const response = await fetch('http://34.93.204.92:3001/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'kartik@vgenomics.co.in',
        password: 'vgenomics'
      })
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as LoginResponse;

    if (!data.token) {
      throw new Error('No token received in login response');
    }

    return data.token;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
}

// Interface for disease information response
export interface DiseaseInfoResponse {
  orpha_id?: string;
  disease_name?: string;
  prevalence?: string;
  inheritance?: string;
  age_of_onset?: string;
  disease_category?: string;
  clinical_description?: string;
  hpo_terms?: string;
  etiology?: string;
  diagnosis?: string;
  management_treatment?: string;
  management_and_treatment?: string;
  genetic_counseling?: string;
  prognosis?: string;
  resources?: Array<{ title: string; url: string }>;

  // Optional fields that might be present
  name?: string;
  description?: string;
  symptoms?: string[];

  // Genetic information
  mutation?: string;
  mutation_type?: string;
  rsid?: string;
  protein_name?: string;
  protein_change?: string;
  pathway?: string;
  source?: string;

  // Drug information
  indication_drugs?: string[];
  contraindication_drugs?: string[];

  // Diagnostic information
  antenatal_diagnosis?: string;

  [key: string]: unknown; // Allow for additional properties
}

/**
 * Fetches detailed information about a specific disease
 * @param diseaseName The name of the disease to fetch information for
 * @param rdxToken The RDX token for authentication
 * @returns Promise with disease information
 */
export async function getDiseaseInfo(diseaseName: string, rdxToken: string): Promise<DiseaseInfoResponse> {
  try {
    const response = await fetch('http://34.93.204.92:3001/doctors/diseaseinfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'rdxtoken': rdxToken
      },
      body: JSON.stringify({ name: diseaseName })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch disease info: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as DiseaseInfoResponse;
  } catch (error) {
    console.error('Error fetching disease info:', error);
    throw error;
  }
}