import { Module } from "@nestjs/common";
import { PrismaModule } from "../shared/infrastructure/database/prisma/prisma.module.js";
import { NodeController } from "../server/infrastructure/http/node.controller.js";
import { RegisterNodeUseCase } from "../server/domain/use-cases/register-node.use-case.js";
import { DisableNodeUseCase } from "../server/domain/use-cases/disable-node.use-case.js";
import { NODE_REPOSITORY } from "../server/domain/repositories/node.repository.js";
import { PrismaNodeRepository } from "../server/infrastructure/persistence/prisma/prisma-node.repository.js";
import { SERVER_REPOSITORY } from "../server/domain/repositories/server.repository.js";
import { PrismaServerRepository } from "../server/infrastructure/persistence/prisma/prisma-server.repository.js";
import { GetAllNodesUseCase } from "../server/domain/use-cases/get-all-nodes.use.case.js";

@Module({
  imports: [PrismaModule],
  controllers: [NodeController],
  providers: [
    RegisterNodeUseCase,
    DisableNodeUseCase,
    GetAllNodesUseCase,
    { provide: NODE_REPOSITORY, useClass: PrismaNodeRepository },
    { provide: SERVER_REPOSITORY, useClass: PrismaServerRepository },
  ],
})
export class NodeModule {}
