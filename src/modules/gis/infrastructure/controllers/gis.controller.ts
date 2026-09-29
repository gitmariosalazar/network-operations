import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { GetNetworkMapGeoJsonUseCase } from '../../application/usecases/queries/GetNetworkMapGeoJsonUseCase';
import { MapGeojsonResponse } from '../../domain/schemas/response/map-geojson';

@Controller()
export class GisController {
  constructor(
    private readonly getNetworkMapGeoJsonUseCase: GetNetworkMapGeoJsonUseCase,
  ) {}

  @MessagePattern('gis.network.map')
  async getNetworkMapGeoJson(): Promise<MapGeojsonResponse> {
    return this.getNetworkMapGeoJsonUseCase.execute();
  }
}
