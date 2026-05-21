import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Server } from "../../domain/entities/server.entity";
import {
  type IServerRepository,
  SERVER_REPOSITORY,
} from "../../domain/repositories/server.repository";

@Injectable()
export class GetServerUseCase {
  constructor(
    @Inject(SERVER_REPOSITORY)
    private readonly serverRepository: IServerRepository
  ) {}

  async execute(serverId: string): Promise<Server> {
    const server = await this.serverRepository.findById(serverId);
    if (!server) throw new NotFoundException(`Server ${serverId} not found`);
    return server;
  }
}
