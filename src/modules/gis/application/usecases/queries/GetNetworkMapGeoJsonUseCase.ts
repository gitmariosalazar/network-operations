import { Injectable } from '@nestjs/common';
import { InterfaceGisRepository } from '../../../domain/contracts/gis.interface.repository';
import { MapGeojsonResponse } from '../../../domain/schemas/response/map-geojson';

@Injectable()
export class GetNetworkMapGeoJsonUseCase {
  constructor(private readonly gisRepository: InterfaceGisRepository) {}

  async execute(): Promise<MapGeojsonResponse> {
    return this.gisRepository.getNetworkMapGeoJson();
  }
}
