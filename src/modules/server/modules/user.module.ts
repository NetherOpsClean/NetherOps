// src/modules/users/infrastructure/user.module.ts
import { Module } from "@nestjs/common";
import { UserController } from "../infrastructure/http/controllers/user.controller";
import { CreateUserUseCase } from "../application/use-cases/create-user.use-case";
import { InMemoryUserRepository } from "../infrastructure/persistence/imp-test-user.repositry";
import { GetAllUsersUseCase } from "../application/use-cases/get-all-users.use-case";

@Module({
  controllers: [UserController],
  providers: [
    // 1. Registramos la implementación real de la base de datos
    InMemoryUserRepository,

    // 2. Configuramos el Caso de Uso
    {
      provide: CreateUserUseCase,
      useFactory: (userRepo: InMemoryUserRepository): CreateUserUseCase => {
        return new CreateUserUseCase(userRepo);
      },
      inject: [InMemoryUserRepository], // NestJS le pasa el repositorio real al caso de uso
    },
    {
      provide: GetAllUsersUseCase,
      useFactory: (userRepo: InMemoryUserRepository): GetAllUsersUseCase => {
        return new GetAllUsersUseCase(userRepo);
      },
      inject: [InMemoryUserRepository],
    },
  ],
})
export class UserModule {}
