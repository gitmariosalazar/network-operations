import { MapGeojsonResponse } from '../../domain/schemas/response/map-geojson';
import { MapGeojsonSqlResult } from '../interfaces/map-geojson.sql.result';

export class GisAdapter {
  static toResponse(sqlResult: MapGeojsonSqlResult): MapGeojsonResponse {
    return {
      type: sqlResult.type,
      features: sqlResult.features.map((feature) => ({
        type: feature.type,
        id: feature.id,
        geometry: {
          type: feature.geometry.type,
          coordinates: feature.geometry.coordinates,
        },
        properties: {
          nodeType: feature.properties.node_type,
          name: feature.properties.name,
          code: feature.properties.code,
          colorMarker: feature.properties.color_marker,
          connectionId: feature.properties.connection_id,
          cadastralKey: feature.properties.cadastral_key,
          suppliedByTank: feature.properties.supplied_by_tank,
          source: feature.properties.source,
          destination: feature.properties.destination,
          distanceInMeters: feature.properties.distance_meters,
        },
      })),
    };
  }
}
