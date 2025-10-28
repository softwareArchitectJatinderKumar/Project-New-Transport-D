export interface MetricMappingModel {
  HeadUID: number;
  AssistantUID: number;
  MetricId: number;
  IsActive: 0 | 1;
  Type: 'PA' | 'PM'; // Assuming these are the two types
  Remarks?: string;
  // Add other fields you expect in your data table (e.g., CreatedBy, CreatedDate, etc.)
  CreatedBy: string;
  CreatedDate: string;
}