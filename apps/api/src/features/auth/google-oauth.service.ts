import { Injectable, ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AccountProvider, NotificationChannel, User } from "@prisma/client";
import { AppConfig } from "../../config/app.config";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { GoogleCallbackInput } from "./dto/auth.schemas";
import { createOpaqueToken } from "./utils/token-hash";

interface GoogleTokenResponse {
  access_token?: string;
}

interface GoogleUserInfoResponse {
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  sub?: string;
}

@Injectable()
export class GoogleOAuthService {
  constructor(
    private readonly configService: ConfigService<AppConfig, true>,
    private readonly prisma: PrismaService
  ) {}

  getAuthorizationUrl(): { url: string } {
    const clientId = this.configService.get("googleClientId", { infer: true });
    const callbackUrl = this.configService.get("googleCallbackUrl", { infer: true });

    if (!clientId || !callbackUrl) {
      throw new ServiceUnavailableException("Google OAuth is not configured.");
    }

    const params = new URLSearchParams({
      access_type: "offline",
      client_id: clientId,
      prompt: "consent",
      redirect_uri: callbackUrl,
      response_type: "code",
      scope: "openid email profile",
      state: createOpaqueToken()
    });

    return {
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    };
  }

  async authenticate(input: GoogleCallbackInput): Promise<User> {
    const profile = await this.fetchProfile(input.code);

    if (!profile.email || !profile.sub || !profile.email_verified) {
      throw new UnauthorizedException("Google account email could not be verified.");
    }

    const email = profile.email.toLowerCase();
    const googleAccountId = profile.sub;

    return this.prisma.$transaction(async (tx) => {
      const existingAccount = await tx.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: AccountProvider.GOOGLE,
            providerAccountId: googleAccountId
          }
        }
      });

      if (existingAccount) {
        return tx.user.findUniqueOrThrow({
          where: { id: existingAccount.userId }
        });
      }

      const existingUser = await tx.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return tx.user.update({
          data: {
            accounts: {
              create: {
                provider: AccountProvider.GOOGLE,
                providerAccountId: googleAccountId
              }
            },
            avatarUrl: existingUser.avatarUrl ?? profile.picture,
            emailVerifiedAt: existingUser.emailVerifiedAt ?? new Date()
          },
          where: { id: existingUser.id }
        });
      }

      return tx.user.create({
        data: {
          accounts: {
            create: {
              provider: AccountProvider.GOOGLE,
              providerAccountId: googleAccountId
            }
          },
          avatarUrl: profile.picture,
          email,
          emailVerifiedAt: new Date(),
          name: profile.name ?? email.split("@")[0],
          notificationSettings: {
            createMany: {
              data: [
                { channel: NotificationChannel.EMAIL },
                { channel: NotificationChannel.IN_APP },
                { channel: NotificationChannel.PUSH, enabled: false }
              ]
            }
          },
          userPreference: {
            create: {}
          }
        }
      });
    });
  }

  private async fetchProfile(code: string): Promise<GoogleUserInfoResponse> {
    const accessToken = await this.exchangeCodeForAccessToken(code);
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!profileResponse.ok) {
      throw new UnauthorizedException("Google profile could not be loaded.");
    }

    return (await profileResponse.json()) as GoogleUserInfoResponse;
  }

  private async exchangeCodeForAccessToken(code: string): Promise<string> {
    const clientId = this.configService.get("googleClientId", { infer: true });
    const clientSecret = this.configService.get("googleClientSecret", { infer: true });
    const callbackUrl = this.configService.get("googleCallbackUrl", { infer: true });

    if (!clientId || !clientSecret || !callbackUrl) {
      throw new ServiceUnavailableException("Google OAuth is not configured.");
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: callbackUrl
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST"
    });

    if (!response.ok) {
      throw new UnauthorizedException("Google authorization code could not be exchanged.");
    }

    const tokens = (await response.json()) as GoogleTokenResponse;

    if (!tokens.access_token) {
      throw new UnauthorizedException("Google did not return an access token.");
    }

    return tokens.access_token;
  }
}
