import { MapGeojsonResponse } from '../schemas/response/map-geojson';

import { ScadaTelemetryResponse } from '../schemas/response/scada-telemetry';

export abstract class InterfaceGisRepository {
  abstract getNetworkMapGeoJson(): Promise<MapGeojsonResponse>;
  abstract getScadaTelemetry(): Promise<ScadaTelemetryResponse[]>;
}
