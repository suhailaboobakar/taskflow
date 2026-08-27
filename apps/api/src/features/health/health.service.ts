import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "../../config/app.config";
import { HealthResponse } from "./health.controller";

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService<AppConfig, true>) {}

  getHealth(): HealthResponse {
    return {
      service: this.configService.get("serviceName", { infer: true }),
      status: "ok",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime())
    };
  }
}
