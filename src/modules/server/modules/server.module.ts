import { Module } from "@nestjs/common";
import { SERVER_REPOSITORY } from "../domain/repositories/server.repository";
import { CONTAINER_PROVIDER } from "../application/ports/container.provider";
import { DockerContainerProvider } from "../infrastructure/docker/docker-container.provider";
import { InMemoryServerRepository } from "../infrastructure/persistence/imp-test-server.repository";
import { CreateServerUseCase } from "../application/use-cases/create-server.use-case";
import { StopServerUseCase } from "../application/use-cases/stop-server.use-case";
import { GetServerUseCase } from "../application/use-cases/get-server.use-case";
import { ServerController } from "../infrastructure/http/controllers/server.controller";

@Module({
  controllers: [ServerController],
  providers: [
    // Infraestructura — las implementaciones concretas
    {
      provide: SERVER_REPOSITORY,
      useClass: InMemoryServerRepository,
    },
    {
      provide: CONTAINER_PROVIDER,
      useClass: DockerContainerProvider,
    },

    // Casos de uso
    CreateServerUseCase,
    StopServerUseCase,
    GetServerUseCase,
  ],
})
export class ServerModule {}
