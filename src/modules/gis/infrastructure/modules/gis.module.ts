import { Module } from '@nestjs/common';
import { GisController } from '../controllers/gis.controller';
import { GetNetworkMapGeoJsonUseCase } from '../../application/usecases/queries/GetNetworkMapGeoJsonUseCase';
import { InterfaceGisRepository } from '../../domain/contracts/gis.interface.repository';
import { GisPostgreSQLPersistence } from '../repositories/postgresql/persistence/gis-postgresql.persistence';
import { DatabasePersistenceModule } from '../../../../shared/connections/database/database-persistence.module';

import { GetScadaTelemetryUseCase } from '../../application/usecases/queries/GetScadaTelemetryUseCase';

@Module({
  imports: [DatabasePersistenceModule],
  controllers: [GisController],
  providers: [
    GetNetworkMapGeoJsonUseCase,
    GetScadaTelemetryUseCase,
    {
      provide: InterfaceGisRepository,
      useClass: GisPostgreSQLPersistence,
    },
  ],
})
export class GisModule {}
