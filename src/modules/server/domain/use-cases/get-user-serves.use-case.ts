import { ServerResponseDto } from "../dtos/server-response.dto.js";
import { IdFactory, UserId } from "../value-objects/id.vo.js";
import { Inject, Injectable } from "@nestjs/common";
import { SERVER_REPOSITORY } from "../../domain/repositories/server.repository.js";
import type { ServerRepository } from "../../domain/repositories/server.repository.js";
import { SERVER_ACCESS_REPOSITORY } from "../../domain/repositories/server-access.repository.js";
import type { ServerAccessRepository } from "../../domain/repositories/server-access.repository.js";
import { USER_REPOSITORY } from "../repositories/user.repository.js";
import type { UserRepository } from "../repositories/user.repository.js";

@Injectable()
export class GetUserServersUseCase {
  constructor(
    @Inject(SERVER_REPOSITORY)
    private readonly serverRepository: ServerRepository,
    @Inject(SERVER_ACCESS_REPOSITORY)
    private readonly serverAccessRepository: ServerAccessRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  async execute(userId: string): Promise<ServerResponseDto[]> {
    const requesterId = IdFactory.load<UserId>(userId);
    const requester = await this.userRepository.findById(requesterId);
    if (!requester) {
      throw new Error("User not found");
    }

    const accesses = await this.serverAccessRepository.findAllByUser(requesterId);
    const owned = await this.serverRepository.findAllByOwner(requesterId);
    const servers: ServerResponseDto[] = [];

    for (const access of accesses) {
      const server = await this.serverRepository.findById(IdFactory.load(access.getServerId()));
      if (server) {
        servers.push(
          new ServerResponseDto(
            server.getId().toString(),
            server.getName(),
            server.getOwnerId().toString()
          )
        );
      }
    }

    for (const server of owned) {
      if (!servers.some((s) => s.id === server.getId().toString())) {
        servers.push(
          new ServerResponseDto(
            server.getId().toString(),
            server.getName(),
            server.getOwnerId().toString()
          )
        );
      }
    }

    return servers;
  }
}
