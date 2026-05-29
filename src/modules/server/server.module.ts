import { Module } from "@nestjs/common";
import { PrismaModule } from "../shared/infrastructure/database/prisma/prisma.module.js";
import { ServerController } from "../server/infrastructure/http/server.controller.js";
import { CreateServerUseCase } from "../server/domain/use-cases/create-server.use-case.js";
import { DeleteServerUseCase } from "../server/domain/use-cases/delete-server.use-case.js";
import { SERVER_REPOSITORY } from "../server/domain/repositories/server.repository.js";
import { PrismaServerRepository } from "../server/infrastructure/persistence/prisma/prisma-server.repository.js";
import { NODE_REPOSITORY } from "../server/domain/repositories/node.repository.js";
import { PrismaNodeRepository } from "../server/infrastructure/persistence/prisma/prisma-node.repository.js";
import { USER_REPOSITORY } from "../server/domain/repositories/user.repository.js";
import { CONTAINER_PROVIDER } from "../server/domain/ports/container.provider.js";
import { DockerContainerProvider } from "../server/infrastructure/docker/docker-container.provider.js";
import { PrismaUserRepository } from "../server/infrastructure/persistence/prisma/prisma-user.repository.js";
import { AddUserToServerUseCase } from "../server/domain/use-cases/add-user-to-server.use-case.js";
import { SERVER_ACCESS_REPOSITORY } from "../server/domain/repositories/server-access.repository.js";
import { PrismaServerAccessRepository } from "../server/infrastructure/persistence/prisma/prisma-server-access.repository.js";
import { GetUserServersUseCase } from "../server/domain/use-cases/get-user-serves.use-case.js";
import { StartServerUseCase } from "./domain/use-cases/start-server.use-case.js";
import { StopServerUseCase } from "./domain/use-cases/stop-server.use-case.js";
import { AuthModule } from "./auth.module.js";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ServerController],
  providers: [
    CreateServerUseCase,
    DeleteServerUseCase,
    AddUserToServerUseCase,
    GetUserServersUseCase,
    StartServerUseCase,
    StopServerUseCase,
    { provide: SERVER_REPOSITORY, useClass: PrismaServerRepository },
    { provide: SERVER_ACCESS_REPOSITORY, useClass: PrismaServerAccessRepository },
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: NODE_REPOSITORY, useClass: PrismaNodeRepository },
    { provide: CONTAINER_PROVIDER, useClass: DockerContainerProvider },
  ],
})
export class ServerModule {}
