import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { configuration, validateEnvironment } from "../config/app.config";
import { HealthModule } from "../features/health/health.module";
import { MetaModule } from "../features/meta/meta.module";
import { DatabaseModule } from "../infrastructure/database/database.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [configuration],
      validate: validateEnvironment
    }),
    DatabaseModule,
    HealthModule,
    MetaModule
  ]
})
export class AppModule {}
