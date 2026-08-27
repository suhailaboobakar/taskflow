import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { GoogleOAuthService } from "./google-oauth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { PasswordResetService } from "./password-reset.service";
import { AuthTokenService } from "./token.service";

@Module({
  controllers: [AuthController],
  imports: [JwtModule.register({})],
  providers: [AuthService, AuthTokenService, GoogleOAuthService, JwtAuthGuard, PasswordResetService],
  exports: [AuthService, JwtAuthGuard]
})
export class AuthModule {}
