import { Injectable } from '@nestjs/common';
import { InterfaceGisRepository } from '../../../domain/contracts/gis.interface.repository';
import { ScadaTelemetryResponse } from '../../../domain/schemas/response/scada-telemetry';

@Injectable()
export class GetScadaTelemetryUseCase {
  constructor(private readonly gisRepository: InterfaceGisRepository) {}

  async execute(): Promise<ScadaTelemetryResponse[]> {
    return this.gisRepository.getScadaTelemetry();
  }
}
