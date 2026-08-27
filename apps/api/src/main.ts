import { ValidationPipe, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import compression from "compression";
import helmet from "helmet";
import { AppModule } from "./app/app.module";
import { AppConfig } from "./config/app.config";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });
  const config = app.get(ConfigService<AppConfig, true>);
  const port = config.get("port", { infer: true });
  const appOrigin = config.get("appOrigin", { infer: true });

  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1"
  });
  app.enableCors({
    credentials: true,
    origin: appOrigin
  });
  app.use(helmet());
  app.use(compression());
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true
    })
  );

  await app.listen(port);
}

void bootstrap();
