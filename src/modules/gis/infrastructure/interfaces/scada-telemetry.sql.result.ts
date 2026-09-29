export interface ScadaTelemetrySqlResult {
  tank_id: number;
  tank_name: string;
  facility_type: string;
  system_status: string;
  max_capacity: string | null;
  max_level_m: string | null;
  level_telemetry: {
    value: number;
    unit: string;
    percentage: number;
    timestamp: string;
  } | null;
  flow_telemetry: {
    value: number;
    unit: string;
    timestamp: string;
  } | null;
  pressure_telemetry: {
    value: number;
    unit: string;
    timestamp: string;
  } | null;
}
