import { Controller, Get } from "@nestjs/common";
import { MetaService } from "./meta.service";

export interface ApiMetaResponse {
  name: string;
  version: string;
}

@Controller({
  path: "meta",
  version: "1"
})
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @Get()
  getMeta(): ApiMetaResponse {
    return this.metaService.getMeta();
  }
}
