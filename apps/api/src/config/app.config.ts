import { z } from "zod";

const environmentSchema = z.object({
  API_PORT: z.coerce.number().int().positive().default(3000),
  APP_ORIGIN: z.string().url().default("http://localhost:5173"),
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development")
});

export type Environment = z.infer<typeof environmentSchema>;

export interface AppConfig {
  appOrigin: string;
  databaseUrl: string;
  environment: Environment["NODE_ENV"];
  port: number;
  serviceName: string;
}

export function validateEnvironment(config: Record<string, unknown>): Environment {
  return environmentSchema.parse(config);
}

export function configuration(): AppConfig {
  const env = validateEnvironment(process.env);

  return {
    appOrigin: env.APP_ORIGIN,
    databaseUrl: env.DATABASE_URL,
    environment: env.NODE_ENV,
    port: env.API_PORT,
    serviceName: "taskflow-api"
  };
}
