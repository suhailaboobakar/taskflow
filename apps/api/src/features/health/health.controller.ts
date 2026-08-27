import { Controller, Get } from "@nestjs/common";
import { HealthService } from "./health.service";

export interface HealthResponse {
  service: string;
  status: "ok";
  timestamp: string;
  uptimeSeconds: number;
}

@Controller({
  path: "health",
  version: "1"
})
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getHealth(): HealthResponse {
    return this.healthService.getHealth();
  }
}
