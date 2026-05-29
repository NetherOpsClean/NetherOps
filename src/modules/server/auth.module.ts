import { Module } from "@nestjs/common";
import { PrismaModule } from "../shared/infrastructure/database/prisma/prisma.module.js";
import { JwtModule } from "@nestjs/jwt";
import { USER_REPOSITORY, UserRepository } from "./domain/repositories/user.repository.js";
import { PrismaUserRepository } from "./infrastructure/persistence/prisma/prisma-user.repository.js";
import { BcryptPasswordHasher } from "./infrastructure/security/bcrypt-password-hasher.adapter.js";
import { JwtTokenProvider } from "./infrastructure/security/jwt-token-provider.adapter.js";
import { AuthenticateUserUseCase } from "./domain/use-cases/authenticate-user.use-case.js";
import { PASSWORD_HASHER, PasswordHasherPort } from "./domain/ports/password-hasher.port.js";
import { TOKEN_PROVIDER, TokenProviderPort } from "./domain/ports/token-provider.port.js";
import { AuthController } from "./infrastructure/http/auth.controller.js";
import { CreateUserUseCase } from "./domain/use-cases/create-user.use-case.js";
import { JwtStrategy } from "./infrastructure/strategies/jwt.strategy.js";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule } from "@nestjs/config";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET") || "clave_secreta_de_desarrollo",
        signOptions: { expiresIn: "1h" },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_PROVIDER, useClass: JwtTokenProvider },

    {
      provide: CreateUserUseCase,
      useFactory: (
        userRepo: UserRepository,
        passwordHasher: PasswordHasherPort
      ): CreateUserUseCase => {
        return new CreateUserUseCase(userRepo, passwordHasher);
      },
      inject: [USER_REPOSITORY, PASSWORD_HASHER],
    },
    {
      provide: AuthenticateUserUseCase,
      useFactory: (
        userRepo: UserRepository,
        passwordHasher: PasswordHasherPort,
        tokenProvider: TokenProviderPort
      ): AuthenticateUserUseCase => {
        return new AuthenticateUserUseCase(userRepo, passwordHasher, tokenProvider);
      },
      inject: [USER_REPOSITORY, PASSWORD_HASHER, TOKEN_PROVIDER],
    },
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
