import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { AuthService } from "./auth.service";
import {
  forgotPasswordSchema,
  googleCallbackSchema,
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
  ForgotPasswordInput,
  GoogleCallbackInput,
  LoginInput,
  LogoutInput,
  RefreshTokenInput,
  RegisterInput,
  ResetPasswordInput
} from "./dto/auth.schemas";
import { AuthenticatedRequest, JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthResponse, AuthenticatedUser, TokenPair } from "./types/auth.types";

@Controller({
  path: "auth",
  version: "1"
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body(new ZodValidationPipe(registerSchema)) body: RegisterInput): Promise<AuthResponse> {
    return this.authService.register(body);
  }

  @Post("login")
  login(@Body(new ZodValidationPipe(loginSchema)) body: LoginInput): Promise<AuthResponse> {
    return this.authService.login(body);
  }

  @Post("refresh")
  refresh(@Body(new ZodValidationPipe(refreshTokenSchema)) body: RefreshTokenInput): Promise<TokenPair> {
    return this.authService.refresh(body);
  }

  @Post("logout")
  logout(@Body(new ZodValidationPipe(logoutSchema)) body: LogoutInput): Promise<{ message: string }> {
    return this.authService.logout(body);
  }

  @Post("forgot-password")
  forgotPassword(
    @Body(new ZodValidationPipe(forgotPasswordSchema)) body: ForgotPasswordInput
  ): Promise<{ message: string; resetToken?: string }> {
    return this.authService.forgotPassword(body);
  }

  @Post("reset-password")
  resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) body: ResetPasswordInput
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(body);
  }

  @Get("google")
  getGoogleAuthorizationUrl(): { url: string } {
    return this.authService.getGoogleAuthorizationUrl();
  }

  @Post("google/callback")
  googleCallback(@Body(new ZodValidationPipe(googleCallbackSchema)) body: GoogleCallbackInput): Promise<AuthResponse> {
    return this.authService.authenticateWithGoogle(body);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  getMe(@Req() request: AuthenticatedRequest): AuthenticatedUser {
    return request.user;
  }
}
