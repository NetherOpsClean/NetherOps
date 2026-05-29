import { IdFactory, ServerId, UserId } from "../value-objects/id.vo.js";
import { DeleteServerDto } from "../dtos/delete-server.dto.js";
import { Injectable, Inject } from "@nestjs/common";
import { SERVER_REPOSITORY } from "../../domain/repositories/server.repository.js";
import type { ServerRepository } from "../../domain/repositories/server.repository.js";
import { NODE_REPOSITORY } from "../../domain/repositories/node.repository.js";
import type { NodeRepository } from "../../domain/repositories/node.repository.js";
import { USER_REPOSITORY } from "../../domain/repositories/user.repository.js";
import type { UserRepository } from "../../domain/repositories/user.repository.js";
import { CONTAINER_PROVIDER } from "../../domain/ports/container.provider.js";
import type { ContainerProvider } from "../../domain/ports/container.provider.js";

@Injectable()
export class DeleteServerUseCase {
  constructor(
    @Inject(SERVER_REPOSITORY)
    private serverRepository: ServerRepository,
    @Inject(NODE_REPOSITORY)
    private nodeRepository: NodeRepository,
    @Inject(CONTAINER_PROVIDER)
    private containerProvider: ContainerProvider,
    @Inject(USER_REPOSITORY)
    private userRepository: UserRepository
  ) {}

  async execute(dto: DeleteServerDto): Promise<void> {
    const serverId = IdFactory.load<ServerId>(dto.serverId);
    const server = await this.serverRepository.findById(serverId);
    if (!server) {
      throw new Error(`Server with ID ${serverId} not found`);
    }

    const requesterId = IdFactory.load<UserId>(dto.requesterId);
    const requester = await this.userRepository.findById(requesterId);
    if (!requester) {
      throw new Error(`requester with ID ${requesterId} not found`);
    }

    // Check if the requester is the owner of the server or has admin privileges
    if (server.getOwnerId() !== requesterId && !requester.isAdmin()) {
      throw new Error("Requester does not have permission to delete this server");
    }

    if (server.getStatus() === "RUNNING") {
      server.stop();
      await this.containerProvider.stop(server.getId().toString());
    }

    await this.serverRepository.delete(server.getId());
    await this.containerProvider.remove(server.getId().toString());
  }
}
