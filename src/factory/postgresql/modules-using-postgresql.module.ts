import { Module } from '@nestjs/common';
import { GisModule } from '../../modules/gis/infrastructure/modules/gis.module';
@Module({
  imports: [GisModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppReadingsModulesUsingPostgreSQL {}
