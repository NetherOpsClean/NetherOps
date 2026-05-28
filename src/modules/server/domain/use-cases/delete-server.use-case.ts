import { ServerRepository } from "../../domain/repositories/server.repository.js";
import { IdFactory, ServerId, UserId } from "../value-objects/id.vo.js";
import { DeleteServerDto } from "../dtos/delete-server.dto.js";
import { NodeRepository } from "../../domain/repositories/node.repository.js";
import { UserRepository } from "../../domain/repositories/user.repository.js";
import { ContainerProvider } from "../../domain/ports/container.provider.js";

export class DeleteServerUseCase {
  constructor(
    private serverRepository: ServerRepository,
    private nodeRepository: NodeRepository,
    private containerProvider: ContainerProvider,
    private userRepository: UserRepository
  ) {}

  async execute(dto: DeleteServerDto): Promise<void> {
    const serverId = IdFactory.load<ServerId>(dto.id);
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
      await this.containerProvider.stop(server.getId());
    }

    await this.serverRepository.delete(server.getId());
    await this.containerProvider.remove(server.getId());
  }
}
