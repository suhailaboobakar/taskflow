import { z } from "zod";

const emailSchema = z.string().trim().email().max(320).toLowerCase();
const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password must be 128 characters or fewer")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number");

export const registerSchema = z.object({
  email: emailSchema,
  name: z.string().trim().min(2).max(120),
  password: passwordSchema,
  timezone: z.string().trim().min(1).max(80).default("UTC")
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
  rememberMe: z.boolean().default(false)
});

export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  token: z.string().trim().min(32).max(256)
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().trim().min(32).max(512)
});

export const logoutSchema = refreshTokenSchema;

export const googleCallbackSchema = z.object({
  code: z.string().trim().min(8).max(2048),
  rememberMe: z.boolean().default(false),
  state: z.string().trim().min(16).max(256).optional()
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type GoogleCallbackInput = z.infer<typeof googleCallbackSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
