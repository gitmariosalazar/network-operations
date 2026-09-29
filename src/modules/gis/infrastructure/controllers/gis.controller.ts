import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { GetNetworkMapGeoJsonUseCase } from '../../application/usecases/queries/GetNetworkMapGeoJsonUseCase';
import { MapGeojsonResponse } from '../../domain/schemas/response/map-geojson';

import { GetScadaTelemetryUseCase } from '../../application/usecases/queries/GetScadaTelemetryUseCase';
import { ScadaTelemetryResponse } from '../../domain/schemas/response/scada-telemetry';

@Controller()
export class GisController {
  constructor(
    private readonly getNetworkMapGeoJsonUseCase: GetNetworkMapGeoJsonUseCase,
    private readonly getScadaTelemetryUseCase: GetScadaTelemetryUseCase,
  ) {}

  @MessagePattern('gis.network.map')
  async getNetworkMapGeoJson(): Promise<MapGeojsonResponse> {
    return this.getNetworkMapGeoJsonUseCase.execute();
  }

  @MessagePattern('gis.scada.telemetry')
  async getScadaTelemetry(): Promise<ScadaTelemetryResponse[]> {
    return this.getScadaTelemetryUseCase.execute();
  }
}
