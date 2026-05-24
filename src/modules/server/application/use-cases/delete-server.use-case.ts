import { ServerRepository } from "../../domain/repositories/server.repository";
import { IdFactory, ServerId, UserId } from "../../shared/domain/value-objects/id.vo";
import { DeleteServerDto } from "../dtos/delete-server.dto";
import { NodeRepository } from "../../domain/repositories/node.repository";
import { UserRepository } from "../../domain/repositories/user.repository";

export class DeleteServerUseCase {
  constructor(
    private serverRepository: ServerRepository,
    private nodeRepository: NodeRepository,
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

    // If the server is running, stop it before deleting
    if (server.getStatus() === "RUNNING") {
      server.stop();
      await this.serverRepository.save(server);
    }

    await this.serverRepository.delete(server.getId());
  }
}
