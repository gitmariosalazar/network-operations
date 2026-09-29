import { Module } from '@nestjs/common';
import { AppController } from './app/controller/app.controller';
import { AppService } from './app/service/app.service';
import { HomeModule } from './app/module/home.module';
import { AppReadingsModulesUsingPostgreSQL } from './factory/postgresql/modules-using-postgresql.module';
import { AppReadingsModulesUsingMySQL } from './factory/mysql/modules-using-mysql.module';
import { DatabasePersistenceModule } from './shared/connections/database/database-persistence.module';
import { environments } from './settings/environments/environments';

const networksOperationsModules =
  environments.DATABASE_TYPE === 'mysql'
    ? AppReadingsModulesUsingMySQL
    : AppReadingsModulesUsingPostgreSQL;

@Module({
  imports: [HomeModule, networksOperationsModules, DatabasePersistenceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
