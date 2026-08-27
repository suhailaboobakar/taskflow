import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { AccountProvider, NotificationChannel } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { GoogleOAuthService } from "./google-oauth.service";
import { PasswordResetService } from "./password-reset.service";
import { AuthTokenService } from "./token.service";
import {
  ForgotPasswordInput,
  GoogleCallbackInput,
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
  ResetPasswordInput
} from "./dto/auth.schemas";
import { AuthResponse, AuthenticatedUser, TokenPair } from "./types/auth.types";

@Injectable()
export class AuthService {
  constructor(
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly passwordResetService: PasswordResetService,
    private readonly prisma: PrismaService,
    private readonly tokenService: AuthTokenService
  ) {}

  async register(input: RegisterInput): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      select: { id: true },
      where: { email: input.email }
    });

    if (existingUser) {
      throw new ConflictException("An account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await this.prisma.user.create({
      data: {
        accounts: {
          create: {
            provider: AccountProvider.PASSWORD,
            providerAccountId: input.email
          }
        },
        email: input.email,
        name: input.name,
        notificationSettings: {
          createMany: {
            data: this.defaultNotificationSettings()
          }
        },
        passwordHash,
        timezone: input.timezone,
        userPreference: {
          create: {}
        }
      }
    });

    return this.tokenService.createAuthResponse(user, false);
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email }
    });

    if (!user?.passwordHash || user.deletedAt) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    return this.tokenService.createAuthResponse(user, input.rememberMe);
  }

  refresh(input: RefreshTokenInput): Promise<TokenPair> {
    return this.tokenService.refresh(input);
  }

  logout(input: RefreshTokenInput): Promise<{ message: string }> {
    return this.tokenService.logout(input);
  }

  forgotPassword(input: ForgotPasswordInput): Promise<{ message: string; resetToken?: string }> {
    return this.passwordResetService.forgotPassword(input);
  }

  resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    return this.passwordResetService.resetPassword(input);
  }

  getGoogleAuthorizationUrl(): { url: string } {
    return this.googleOAuthService.getAuthorizationUrl();
  }

  async authenticateWithGoogle(input: GoogleCallbackInput): Promise<AuthResponse> {
    const user = await this.googleOAuthService.authenticate(input);
    return this.tokenService.createAuthResponse(user, input.rememberMe);
  }

  validateAccessToken(accessToken: string): Promise<AuthenticatedUser> {
    return this.tokenService.validateAccessToken(accessToken);
  }

  private defaultNotificationSettings(): Array<{ channel: NotificationChannel; enabled?: boolean }> {
    return [
      { channel: NotificationChannel.EMAIL },
      { channel: NotificationChannel.IN_APP },
      { channel: NotificationChannel.PUSH, enabled: false }
    ];
  }
}
