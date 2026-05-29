import { Injectable, Inject } from "@nestjs/common";
import {
  CONTAINER_PROVIDER,
  type ContainerProvider,
} from "../../domain/ports/container.provider.js";
import {
  SERVER_REPOSITORY,
  type ServerRepository,
} from "../../domain/repositories/server.repository.js";
import { IdFactory, UserId, ServerId } from "../value-objects/id.vo.js";

@Injectable()
export class SendServerCommandUseCase {
  constructor(
    @Inject(CONTAINER_PROVIDER) private containerProvider: ContainerProvider,
    @Inject(SERVER_REPOSITORY) private serverRepository: ServerRepository
  ) {}

  async execute(serverIdStr: string, userIdStr: string, command: string): Promise<void> {
    const serverId = IdFactory.load<ServerId>(serverIdStr);
    const userId = IdFactory.load<UserId>(userIdStr);

    const server = await this.serverRepository.findById(serverId);
    if (!server) {
      throw new Error("Server not found");
    }

    const isOwner = userId.toString() === server.getOwnerId().toString();
    if (!isOwner) throw new Error("Unauthorized to access this server console");

    const cleanCommand = command.startsWith("/") ? command.substring(1) : command;

    await this.containerProvider.executeCommand(serverId, cleanCommand);
  }
}
