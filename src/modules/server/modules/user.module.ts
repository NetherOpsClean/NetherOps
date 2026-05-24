// src/modules/users/infrastructure/user.module.ts
import { Module } from "@nestjs/common";
import { UserController } from "../infrastructure/http/controllers/user.controller";
import { CreateServerUseCase } from "../application/use-cases/create-server.use-case";
import { CreateUserUseCase } from "../application/use-cases/create-user.use-case";
import { GetAllUsersUseCase } from "../application/use-cases/get-all-users.use-case";

@Module({
  controllers: [UserController],
  providers: [CreateServerUseCase, CreateUserUseCase, GetAllUsersUseCase],
})
export class UserModule {}
