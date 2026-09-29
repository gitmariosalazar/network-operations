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
  node_type: 'TANK' | 'CONNECTION' | 'VIRTUAL_LINK';
  name?: string;
  code?: string;
  color_marker?: string;
  connection_id?: string;
  cadastral_key?: string;
  supplied_by_tank?: string;
  source?: string;
  destination?: string;
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
