// OverviewCard.tsx
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Shape of a single overview object (keys are from your API). */
export type DiseaseOverview = Partial<Record<
  | "prevalence"
  | "inheritance"
  | "age_of_onset"
  | "disease_category"
  | "epidemiology"
  | "clinical_description"
  | "etiology"
  | "diagnostic_methods"
  | "tests_order"
  | "prognosis"
  | "protein_name"
  | "mutation"
  | "mutation_type"
  | "mutation_length"
  | "mutation_region"
  | "protein_change"
  | "mutation_location"
  | "reference_genome"
  | "indication_drugs"
  | "contraindication_drugs"
  | "off_label_use"
  | "exposure"
  | "pathway"
  | "genetic_counseling"
  | "antenatal_diagnosis"
  | "source"
  | "hpo_terms"
  | "disease_name"
  | "orpha_id"
  , string>>;

type Props = {
  /** Raw payload as returned by your API (array with one object or the object itself). */
  payload: DiseaseOverview[] | DiseaseOverview | null | undefined;
  /** Optional short description/summary from the disease entity. */
  description?: string;
};

const FIELDS: Array<{ key: keyof DiseaseOverview; label: string }> = [
  { key: "prevalence", label: "Prevalence" },
  { key: "inheritance", label: "Inheritance" },
  { key: "age_of_onset", label: "Age of Onset" },
  { key: "disease_category", label: "Disease Category" },
  { key: "epidemiology", label: "Epidemiology" },
  { key: "clinical_description", label: "Clinical Description" },
  { key: "etiology", label: "Etiology" },
  { key: "diagnostic_methods", label: "Diagnostic Methods" },
  { key: "tests_order", label: "Recommended Test Order" },
  { key: "prognosis", label: "Prognosis" },
  { key: "protein_name", label: "Protein Name" },
  { key: "mutation", label: "Mutation (Overview)" },
  { key: "mutation_type", label: "Mutation Type" },
  { key: "mutation_length", label: "Mutation Length" },
  { key: "mutation_region", label: "Mutation Region" },
  { key: "protein_change", label: "Protein Change" },
  { key: "mutation_location", label: "Mutation Location" },
  { key: "reference_genome", label: "Reference Genome" },
  { key: "indication_drugs", label: "Approved Drugs" },
  { key: "contraindication_drugs", label: "Contraindicated / Caution" },
  { key: "off_label_use", label: "Off-label Use" },
  { key: "exposure", label: "Exposures / Modifiers" },
  { key: "pathway", label: "Pathway" },
  { key: "genetic_counseling", label: "Genetic Counseling" },
  { key: "antenatal_diagnosis", label: "Antenatal Diagnosis" },
  { key: "source", label: "Sources" },
  { key: "hpo_terms", label: "HPO Terms (long)" },
];

export default function OverviewCard({ payload, description }: Props) {
  const data: DiseaseOverview | null = useMemo(() => {
    if (!payload) return null;
    if (Array.isArray(payload)) return payload[0] ?? null;
    return payload;
  }, [payload]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Disease Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Optional short summary */}
        {description && (
          <section className="space-y-2">
            <h4 className="font-medium">Summary</h4>
            <div className="text-muted-foreground prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {description}
              </ReactMarkdown>
            </div>
          </section>
        )}

        {/* Compact header fields if present */}
        {data && (data.disease_name || data.orpha_id) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.disease_name && (
              <div>
                <div className="text-xs uppercase text-muted-foreground">Disease</div>
                <div className="text-sm">{data.disease_name}</div>
              </div>
            )}
            {data.orpha_id && (
              <div>
                <div className="text-xs uppercase text-muted-foreground">Orpha ID</div>
                <div className="text-sm">{data.orpha_id}</div>
              </div>
            )}
          </div>
        )}

        {/* Long-form sections */}
        {data ? (
          FIELDS.map(({ key, label }) => {
            const val = data[key];
            if (!val) return null;
            return (
              <section key={String(key)} className="space-y-2">
                <h4 className="font-medium">{label}</h4>
                <div className="text-muted-foreground prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {String(val)}
                  </ReactMarkdown>
                </div>
              </section>
            );
          })
        ) : (
          <div className="text-sm text-muted-foreground">
            No additional overview data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
