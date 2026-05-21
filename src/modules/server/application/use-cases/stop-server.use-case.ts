import { Inject, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import {
  type IServerRepository,
  SERVER_REPOSITORY,
} from "../../domain/repositories/server.repository";
import { CONTAINER_PROVIDER, type IContainerProvider } from "../ports/container.provider";

@Injectable()
export class StopServerUseCase {
  constructor(
    @Inject(SERVER_REPOSITORY)
    private readonly serverRepository: IServerRepository,
    @Inject(CONTAINER_PROVIDER)
    private readonly containerProvider: IContainerProvider
  ) {}

  async execute(serverId: string): Promise<void> {
    const server = await this.serverRepository.findById(serverId);
    if (!server) throw new NotFoundException(`Server ${serverId} not found`);
    if (!server.isRunning()) throw new BadRequestException("Server is not running");

    await this.containerProvider.stop(server.containerId!);
    await this.containerProvider.remove(server.containerId!);

    server.markAsStopped();
    await this.serverRepository.save(server);
  }
}
