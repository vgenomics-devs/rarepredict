// Mock API for rare disease prediction
export interface Disease {
  id: string;
  name: string;
  confidence: number;
  description: string;
  symptoms: string[];
  prevalence: string;
  links: { title: string; url: string; }[];
}

export const mockDiseases: Disease[] = [
  {
    id: "1",
    name: "Ehlers-Danlos Syndrome",
    confidence: 78,
    description: "A group of inherited disorders that affect connective tissues, primarily the skin, joints, and blood vessel walls. Connective tissue provides strength and flexibility to structures throughout the body.",
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
    description: "A disorder characterized by widespread musculoskeletal pain accompanied by fatigue, sleep, memory, and mood issues. Researchers believe that fibromyalgia amplifies painful sensations.",
    symptoms: ["Muscle pain", "Fatigue", "Sleep problems", "Memory loss", "Joint pain"],
    prevalence: "2-4% of the population, more common in women",
    links: [
      { title: "Mayo Clinic - Fibromyalgia", url: "https://www.mayoclinic.org/diseases-conditions/fibromyalgia" },
      { title: "National Fibromyalgia Association", url: "https://www.fmaware.org/" }
    ]
  },
  {
    id: "3",
    name: "Sjögren's Syndrome", 
    confidence: 65,
    description: "An autoimmune disorder in which the body's immune system attacks its own healthy cells that produce saliva and tears. This results in dry mouth and dry eyes, and can affect other parts of the body.",
    symptoms: ["Fatigue", "Joint pain", "Dry mouth", "Difficulty swallowing", "Vision problems"],
    prevalence: "0.1-0.6% of adults, predominantly affects women",
    links: [
      { title: "Sjögren's Foundation", url: "https://www.sjogrens.org/" },
      { title: "Mayo Clinic - Sjögren's Syndrome", url: "https://www.mayoclinic.org/diseases-conditions/sjogrens-syndrome" }
    ]
  },
  {
    id: "4",
    name: "Postural Orthostatic Tachycardia Syndrome (POTS)",
    confidence: 58,
    description: "A form of dysautonomia characterized by an abnormal increase in heart rate that occurs when moving from a lying down to standing up position. It affects the autonomic nervous system.",
    symptoms: ["Dizziness", "Fatigue", "Headache", "Nausea", "Weakness"],
    prevalence: "1-3 million Americans, primarily affects women ages 15-50",
    links: [
      { title: "Dysautonomia International", url: "https://www.dysautonomiainternational.org/page.php?ID=30" },
      { title: "Mayo Clinic - POTS", url: "https://www.mayoclinic.org/diseases-conditions/postural-orthostatic-tachycardia-syndrome" }
    ]
  },
  {
    id: "5",
    name: "Hashimoto's Thyroiditis",
    confidence: 52,
    description: "An autoimmune condition where the immune system attacks the thyroid gland, leading to hypothyroidism. It's the most common cause of hypothyroidism in developed countries.",
    symptoms: ["Fatigue", "Weight gain", "Depression", "Memory loss", "Hair loss"],
    prevalence: "1-2% of the population, 5-8 times more common in women",
    links: [
      { title: "American Thyroid Association", url: "https://www.thyroid.org/hashimotos-thyroiditis/" },
      { title: "Mayo Clinic - Hashimoto's Disease", url: "https://www.mayoclinic.org/diseases-conditions/hashimotos-disease" }
    ]
  }
];

export const predictRareDiseases = async (symptoms: string[], age: number): Promise<Disease[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock algorithm: Score diseases based on symptom overlap
  const scoredDiseases = mockDiseases.map(disease => {
    const matchingSymptoms = disease.symptoms.filter(symptom => 
      symptoms.some(userSymptom => 
        symptom.toLowerCase().includes(userSymptom.toLowerCase()) ||
        userSymptom.toLowerCase().includes(symptom.toLowerCase())
      )
    );
    
    // Adjust confidence based on age and symptom matches
    let confidence = disease.confidence;
    if (matchingSymptoms.length > 0) {
      confidence = Math.min(95, confidence + (matchingSymptoms.length * 5));
    } else {
      confidence = Math.max(15, confidence - 20);
    }
    
    // Age-based adjustments (very simplified)
    if (disease.name.includes("Hashimoto") && age > 30) {
      confidence += 10;
    }
    if (disease.name.includes("POTS") && age < 50) {
      confidence += 5;
    }
    
    return {
      ...disease,
      confidence: Math.round(confidence)
    };
  });
  
  // Filter and sort by confidence
  return scoredDiseases
    .filter(disease => disease.confidence > 25)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5); // Return top 5 matches
};