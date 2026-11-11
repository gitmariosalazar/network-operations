export type GeoJsonCoordinates = number[] | number[][] | number[][][];

export interface GeoJsonGeometrySqlResult {
  type:
    | 'Point'
    | 'LineString'
    | 'Polygon'
    | 'MultiPoint'
    | 'MultiLineString'
    | 'MultiPolygon';
  coordinates: GeoJsonCoordinates;
}

export interface GeoJsonFeaturePropertiesSqlResult {
  node_type: string;
  name?: string;
  code?: string;
  facility_type?: string;
  color_marker?: string;
  connection_id?: string;
  cadastral_key?: string;
  supplied_by_tank?: string;
  supplier_type?: string;
  source?: string;
  source_code?: string;
  source_type?: string;
  destination?: string;
  destination_code?: string;
  destination_type?: string;
  pipeline_material?: string;
  pipeline_diameter_mm?: number;
  distance_meters?: number;
}

export interface GeoJsonFeatureSqlResult {
  type: 'Feature';
  id?: string;
  geometry: GeoJsonGeometrySqlResult;
  properties: GeoJsonFeaturePropertiesSqlResult;
}

export interface MapGeojsonSqlResult {
  type: 'FeatureCollection';
  features: GeoJsonFeatureSqlResult[];
}
