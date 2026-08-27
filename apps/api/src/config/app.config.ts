import { z } from "zod";

const environmentSchema = z.object({
  API_PORT: z.coerce.number().int().positive().default(3000),
  APP_ORIGIN: z.string().url().default("http://localhost:5173"),
  DATABASE_URL: z.string().url(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  JWT_ACCESS_SECRET: z.string().min(32).default("dev-access-secret-change-before-production"),
  JWT_REFRESH_SECRET: z.string().min(32).default("dev-refresh-secret-change-before-production"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development")
}).superRefine((env, context) => {
  if (env.NODE_ENV !== "production") {
    return;
  }

  if (env.JWT_ACCESS_SECRET.startsWith("dev-")) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "JWT_ACCESS_SECRET must be set to a production secret",
      path: ["JWT_ACCESS_SECRET"]
    });
  }

  if (env.JWT_REFRESH_SECRET.startsWith("dev-")) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "JWT_REFRESH_SECRET must be set to a production secret",
      path: ["JWT_REFRESH_SECRET"]
    });
  }
});

export type Environment = z.infer<typeof environmentSchema>;

export interface AppConfig {
  appOrigin: string;
  databaseUrl: string;
  environment: Environment["NODE_ENV"];
  googleCallbackUrl?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
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
    googleCallbackUrl: env.GOOGLE_CALLBACK_URL,
    googleClientId: env.GOOGLE_CLIENT_ID,
    googleClientSecret: env.GOOGLE_CLIENT_SECRET,
    jwtAccessSecret: env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: env.JWT_REFRESH_SECRET,
    port: env.API_PORT,
    serviceName: "taskflow-api"
  };
}
