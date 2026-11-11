import { MapGeojsonResponse } from '../../domain/schemas/response/map-geojson';
import { MapGeojsonSqlResult } from '../interfaces/map-geojson.sql.result';

import { ScadaTelemetryResponse } from '../../domain/schemas/response/scada-telemetry';
import { ScadaTelemetrySqlResult } from '../interfaces/scada-telemetry.sql.result';

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
          facilityType: feature.properties.facility_type,
          colorMarker: feature.properties.color_marker,
          connectionId: feature.properties.connection_id,
          cadastralKey: feature.properties.cadastral_key,
          suppliedByTank: feature.properties.supplied_by_tank,
          supplierType: feature.properties.supplier_type,
          source: feature.properties.source,
          sourceCode: feature.properties.source_code,
          sourceType: feature.properties.source_type,
          destination: feature.properties.destination,
          destinationCode: feature.properties.destination_code,
          destinationType: feature.properties.destination_type,
          pipelineMaterial: feature.properties.pipeline_material,
          pipelineDiameterMm: feature.properties.pipeline_diameter_mm
            ? Number(feature.properties.pipeline_diameter_mm)
            : undefined,
          distanceInMeters: feature.properties.distance_meters
            ? Number(feature.properties.distance_meters)
            : undefined,
        },
      })),
    };
  }

  static toScadaTelemetryResponse(
    sqlResults: ScadaTelemetrySqlResult[],
  ): ScadaTelemetryResponse[] {
    if (!sqlResults || sqlResults.length === 0) return [];
    
    return sqlResults.map((row) => ({
      tankId: row.tank_id,
      tankName: row.tank_name,
      facilityType: row.facility_type,
      systemStatus: row.system_status,
      maxCapacity: row.max_capacity ? parseFloat(row.max_capacity) : null,
      maxLevelM: row.max_level_m ? parseFloat(row.max_level_m) : null,
      levelTelemetry: row.level_telemetry,
      flowTelemetry: row.flow_telemetry,
      pressureTelemetry: row.pressure_telemetry,
    }));
  }
}
