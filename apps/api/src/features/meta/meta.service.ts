import { Injectable } from "@nestjs/common";
import { ApiMetaResponse } from "./meta.controller";

@Injectable()
export class MetaService {
  getMeta(): ApiMetaResponse {
    return {
      name: "Taskflow API",
      version: "0.1.0"
    };
  }
}
