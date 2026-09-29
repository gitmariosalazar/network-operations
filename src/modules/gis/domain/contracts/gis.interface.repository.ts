import { MapGeojsonResponse } from '../schemas/response/map-geojson';

export abstract class InterfaceGisRepository {
  abstract getNetworkMapGeoJson(): Promise<MapGeojsonResponse>;
}
