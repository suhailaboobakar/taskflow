import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { AppConfig } from "../../config/app.config";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { RefreshTokenInput } from "./dto/auth.schemas";
import { AccessTokenPayload, AuthResponse, AuthenticatedUser, TokenPair } from "./types/auth.types";
import { createOpaqueToken, hashOpaqueToken } from "./utils/token-hash";

@Injectable()
export class AuthTokenService {
  private readonly accessTokenTtlSeconds = 15 * 60;
  private readonly refreshTokenTtlSeconds = 30 * 24 * 60 * 60;
  private readonly rememberedRefreshTokenTtlSeconds = 90 * 24 * 60 * 60;

  constructor(
    private readonly configService: ConfigService<AppConfig, true>,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async createAuthResponse(user: User, rememberMe: boolean): Promise<AuthResponse> {
    return {
      tokens: await this.issueTokens(user, rememberMe),
      user: this.toAuthenticatedUser(user)
    };
  }

  async refresh(input: RefreshTokenInput): Promise<TokenPair> {
    const storedToken = await this.prisma.refreshToken.findUnique({
      include: { user: true },
      where: { tokenHash: hashOpaqueToken(input.refreshToken) }
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt <= new Date() || storedToken.user.deletedAt) {
      throw new ForbiddenException("Refresh token is invalid or expired.");
    }

    await this.prisma.refreshToken.update({
      data: { revokedAt: new Date() },
      where: { id: storedToken.id }
    });

    return this.issueTokens(storedToken.user, storedToken.rememberMe);
  }

  async logout(input: RefreshTokenInput): Promise<{ message: string }> {
    await this.prisma.refreshToken.updateMany({
      data: { revokedAt: new Date() },
      where: {
        revokedAt: null,
        tokenHash: hashOpaqueToken(input.refreshToken)
      }
    });

    return { message: "Signed out successfully." };
  }

  async validateAccessToken(accessToken: string): Promise<AuthenticatedUser> {
    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(accessToken, {
        secret: this.configService.get("jwtAccessSecret", { infer: true })
      });
      const user = await this.prisma.user.findUnique({
        select: {
          deletedAt: true,
          email: true,
          id: true,
          name: true
        },
        where: { id: payload.sub }
      });

      if (!user || user.deletedAt) {
        throw new UnauthorizedException("Access token user is no longer active.");
      }

      return {
        email: user.email,
        id: user.id,
        name: user.name
      };
    } catch {
      throw new UnauthorizedException("Access token is invalid or expired.");
    }
  }

  private async issueTokens(user: User, rememberMe: boolean): Promise<TokenPair> {
    const accessTokenExpiresAt = new Date(Date.now() + this.accessTokenTtlSeconds * 1000);
    const refreshTokenTtl = rememberMe ? this.rememberedRefreshTokenTtlSeconds : this.refreshTokenTtlSeconds;
    const refreshTokenExpiresAt = new Date(Date.now() + refreshTokenTtl * 1000);
    const refreshToken = createOpaqueToken();

    const accessToken = await this.jwtService.signAsync(
      {
        email: user.email,
        name: user.name,
        sub: user.id
      } satisfies AccessTokenPayload,
      {
        expiresIn: this.accessTokenTtlSeconds,
        secret: this.configService.get("jwtAccessSecret", { infer: true })
      }
    );

    await this.prisma.refreshToken.create({
      data: {
        expiresAt: refreshTokenExpiresAt,
        rememberMe,
        tokenHash: hashOpaqueToken(refreshToken),
        userId: user.id
      }
    });

    return {
      accessToken,
      accessTokenExpiresAt: accessTokenExpiresAt.toISOString(),
      refreshToken,
      refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString()
    };
  }

  private toAuthenticatedUser(user: Pick<User, "email" | "id" | "name">): AuthenticatedUser {
    return {
      email: user.email,
      id: user.id,
      name: user.name
    };
  }
}
