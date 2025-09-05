import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import '@/index.css'

interface DiseaseInfoSectionProps {
  diseaseInfo: {
    orpha_id?: string;
    disease_name?: string;
    prevalence?: string;
    inheritance?: string;
    age_of_onset?: string;
    disease_category?: string;
    epidemiology?: string;
    clinical_description?: string;
    hpo_terms?: string;
    etiology?: string;
    diagnostic_methods?: string;
    differential_diagnosis?: string;
    antenatal_diagnosis?: string;
    genetic_counseling?: string;
    management_and_treatment?: string;
    tests_order?: string;
    prognosis?: string;
    protein_name?: string;
    mutation?: string;
    rsid?: string;
    mutation_length?: string;
    mutation_region?: string;
    mutation_type?: string;
    protein_change?: string;
    mutation_location?: string;
    reference_genome?: string;
    indication_drugs?: string;
    contraindication_drugs?: string;
    off_label_use?: string;
    exposure?: string;
    pathway?: string;
    source?: string;
  };
}

export function DiseaseInfoSection({ diseaseInfo }: DiseaseInfoSectionProps) {
  if (!diseaseInfo) {
    return <div>No disease information available</div>;
  }

  const renderSection = (title: string, content?: string) => {
    if (!content) return null;
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{content}</p>
      </div>
    );
  };

  const renderList = (title: string, items: string) => {
    if (!items) return null;
    const itemList = items.split(';').filter(Boolean);
    if (itemList.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          {itemList.map((item, index) => (
            <li key={index}>{item.trim()}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {diseaseInfo.disease_name || 'Disease Information'}
            {diseaseInfo.orpha_id && (
              <Badge variant="outline" className="text-sm">
                ORPHA:{diseaseInfo.orpha_id}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderSection('Disease Category', diseaseInfo.disease_category)}
            {renderSection('Prevalence', diseaseInfo.prevalence)}
            {renderSection('Inheritance', diseaseInfo.inheritance)}
            {renderSection('Age of Onset', diseaseInfo.age_of_onset)}
          </div>

          {/* Clinical Information */}
          {renderSection('Clinical Description', diseaseInfo.clinical_description)}
          {renderList('HPO Terms', diseaseInfo.hpo_terms)}
          {renderSection('Etiology', diseaseInfo.etiology)}
          {renderSection('Epidemiology', diseaseInfo.epidemiology)}

          {/* Diagnosis */}
          <div className="border-t pt-6 mt-6">
            <h2 className="text-xl font-bold mb-4">Diagnosis</h2>
            {renderSection('Diagnostic Methods', diseaseInfo.diagnostic_methods)}
            {renderSection('Differential Diagnosis', diseaseInfo.differential_diagnosis)}
            {renderSection('Antenatal Diagnosis', diseaseInfo.antenatal_diagnosis)}
          </div>

          {/* Management */}
          <div className="border-t pt-6 mt-6">
            <h2 className="text-xl font-bold mb-4">Management & Treatment</h2>
            {renderSection('Management and Treatment', diseaseInfo.management_and_treatment)}
            {renderList('Indication Drugs', diseaseInfo.indication_drugs)}
            {renderList('Contraindication Drugs', diseaseInfo.contraindication_drugs)}
            {renderSection('Off-label Use', diseaseInfo.off_label_use)}
            {renderSection('Genetic Counseling', diseaseInfo.genetic_counseling)}
            {renderSection('Prognosis', diseaseInfo.prognosis)}
          </div>

          {/* Genetic Information */}
          <div className="border-t pt-6 mt-6">
            <h2 className="text-xl font-bold mb-4">Genetic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderSection('Protein Name', diseaseInfo.protein_name)}
              {renderSection('Mutation', diseaseInfo.mutation)}
              {renderSection('RSID', diseaseInfo.rsid)}
              {renderSection('Mutation Type', diseaseInfo.mutation_type)}
              {renderSection('Protein Change', diseaseInfo.protein_change)}
              {renderSection('Mutation Location', diseaseInfo.mutation_location)}
              {renderSection('Reference Genome', diseaseInfo.reference_genome)}
              {renderSection('Pathway', diseaseInfo.pathway)}
            </div>
          </div>

          {/* Additional Information */}
          <div className="border-t pt-6 mt-6">
            <h2 className="text-xl font-bold mb-4">Additional Information</h2>
            {renderSection('Exposure', diseaseInfo.exposure)}
            {renderSection('Source', diseaseInfo.source)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
