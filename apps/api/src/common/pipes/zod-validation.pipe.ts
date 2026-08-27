import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { ZodError, ZodSchema } from "zod";

@Injectable()
export class ZodValidationPipe<TInput, TOutput> implements PipeTransform<TInput, TOutput> {
  constructor(private readonly schema: ZodSchema<TOutput>) {}

  transform(value: TInput): TOutput {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          code: "VALIDATION_FAILED",
          issues: error.issues.map((issue) => ({
            message: issue.message,
            path: issue.path.join(".")
          })),
          message: "Request validation failed"
        });
      }

      throw error;
    }
  }
}
