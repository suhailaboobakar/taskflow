import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import bcrypt from "bcryptjs";
import { AppConfig } from "../../config/app.config";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { ForgotPasswordInput, ResetPasswordInput } from "./dto/auth.schemas";
import { createOpaqueToken, hashOpaqueToken } from "./utils/token-hash";

@Injectable()
export class PasswordResetService {
  private readonly resetTokenTtlMinutes = 30;

  constructor(
    private readonly configService: ConfigService<AppConfig, true>,
    private readonly prisma: PrismaService
  ) {}

  async forgotPassword(input: ForgotPasswordInput): Promise<{ message: string; resetToken?: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email }
    });

    if (!user || user.deletedAt) {
      return { message: "If an account exists, password reset instructions will be sent." };
    }

    const resetToken = createOpaqueToken();
    const expiresAt = new Date(Date.now() + this.resetTokenTtlMinutes * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: {
        expiresAt,
        tokenHash: hashOpaqueToken(resetToken),
        userId: user.id
      }
    });

    if (this.configService.get("environment", { infer: true }) === "production") {
      return { message: "If an account exists, password reset instructions will be sent." };
    }

    return {
      message: "Password reset token created.",
      resetToken
    };
  }

  async resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      include: { user: true },
      where: { tokenHash: hashOpaqueToken(input.token) }
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date() || resetToken.user.deletedAt) {
      throw new ForbiddenException("Password reset token is invalid or expired.");
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        data: { passwordHash: await bcrypt.hash(input.password, 12) },
        where: { id: resetToken.userId }
      }),
      this.prisma.passwordResetToken.update({
        data: { usedAt: new Date() },
        where: { id: resetToken.id }
      }),
      this.prisma.refreshToken.updateMany({
        data: { revokedAt: new Date() },
        where: {
          revokedAt: null,
          userId: resetToken.userId
        }
      })
    ]);

    return { message: "Password reset successfully." };
  }
}
