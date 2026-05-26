import { Module } from "@nestjs/common";
import { PrismaModule } from "../shared/infrastructure/database/prisma/prisma.module.js";
import { ServerController } from "../server/infrastructure/http/server.controller.js";
import { CreateServerUseCase } from "../server/domain/use-cases/create-server.use-case.js";
import { DeleteServerUseCase } from "../server/domain/use-cases/delete-server.use-case.js";
import { SERVER_REPOSITORY } from "../server/domain/repositories/server.repository.js";
import { PrismaServerRepository } from "../server/infrastructure/persistence/prisma/prisma-server.repository.js";
import { NODE_REPOSITORY } from "../server/domain/repositories/node.repository.js";
import { PrismaNodeRepository } from "../server/infrastructure/persistence/prisma/prisma-node.repository.js";

@Module({
  imports: [PrismaModule],
  controllers: [ServerController],
  providers: [
    CreateServerUseCase,
    DeleteServerUseCase,
    { provide: SERVER_REPOSITORY, useClass: PrismaServerRepository },
    { provide: NODE_REPOSITORY, useClass: PrismaNodeRepository },
  ],
})
export class ServerModule {}
