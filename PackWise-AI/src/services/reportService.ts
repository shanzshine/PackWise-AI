import { supabase } from '@/lib/supabase';
import { AnalysisResult } from '@/lib/workflow-store';

export type ReportType = "analysis" | "attachment-plan" | "risk" | "sustainability" | "cost";
export type ReportStatus = "completed" | "processing" | "draft";

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  product: string;
  status: ReportStatus;
  date: string;
  size: string;
  insights: string[];
  summary: string;
}

export async function saveReportData(analysis: AnalysisResult, zonePlan: any[]) {
  // We will insert into product_analyses based on our app's structure
  // Note: if the DB columns are different, you may need to adjust these object keys
  const { error } = await supabase
    .from('product_analyses')
    .insert([
      {
        product_name: analysis.productName,
        // We'll store the plan directly as JSON inside the analysis row for simplicity,
        // or you can add logic to insert into packaging_plan table separately.
        analysis_data: analysis,
        zone_plan: zonePlan,
        created_at: new Date().toISOString()
      }
    ]);

  if (error) {
    console.error('Error saving to Supabase:', error);
    throw error;
  }
}

export async function fetchReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from('product_analyses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reports from Supabase:', error);
    return [];
  }

  return (data || []).map((row: any) => {
    // Map Supabase rows to our Report interface
    // Since we're assuming the schema, we'll try to extract what we can
    const date = new Date(row.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const analysisData = row.analysis_data || {};
    
    // Fallback logic if the data is inserted manually or lacks our JSON structure
    const productName = row.product_name || analysisData.productName || "Unknown Product";
    const insights = [];
    
    if (analysisData.poseComplexityScore) {
      insights.push(`Pose complexity score ${analysisData.poseComplexityScore}/100`);
    }
    if (row.zone_plan && Array.isArray(row.zone_plan)) {
      insights.push(`${row.zone_plan.length} attachment zones planned`);
    }

    return {
      id: row.id ? row.id.substring(0, 8) : `RPT-${Math.floor(Math.random() * 10000)}`,
      name: `${productName} — Analysis & Plan`,
      type: "analysis",
      product: productName,
      status: "completed",
      date,
      size: "—",
      summary: `Saved AI analysis for ${productName}.`,
      insights: insights.length > 0 ? insights : ["Data loaded from Supabase"]
    };
  });
}
