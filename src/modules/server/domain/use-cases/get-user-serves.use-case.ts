import { ServerResponseDto } from "../dtos/server-response.dto.js";
import { IdFactory, UserId, ServerId } from "../value-objects/id.vo.js";
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

  private mapStatusToFrontend(domainStatus: string): "online" | "offline" | "starting" {
    switch (domainStatus) {
      case "RUNNING":
        return "online";
      case "STARTING":
        return "starting";
      default:
        return "offline";
    }
  }

  async execute(userId: string): Promise<ServerResponseDto[]> {
    const requesterId = IdFactory.load<UserId>(userId);
    const requester = await this.userRepository.findById(requesterId);
    if (!requester) {
      throw new Error("User not found");
    }

    const ownedServers = await this.serverRepository.findAllByOwner(requesterId);
    const accesses = await this.serverAccessRepository.findAllByUser(requesterId);

    const response: ServerResponseDto[] = [];
    const processedServerIds = new Set<string>();

    for (const server of ownedServers) {
      const serverIdStr = server.getId().toString();
      processedServerIds.add(serverIdStr);

      response.push(
        new ServerResponseDto(
          serverIdStr,
          server.getName(),
          this.mapStatusToFrontend(server.getStatus()),
          "OWNER",
          server.getNodeId().toString(),
          `${server.getMemoryMb()} MB`,
          server.getPort()
        )
      );
    }

    for (const access of accesses) {
      const serverIdStr = access.getServerId().toString();

      if (processedServerIds.has(serverIdStr)) continue;

      const server = await this.serverRepository.findById(IdFactory.load(access.getServerId()));
      if (server) {
        processedServerIds.add(serverIdStr);

        const owner = await this.userRepository.findById(server.getOwnerId());
        const ownerName = owner ? owner.getName() : "Unknown";

        response.push(
          new ServerResponseDto(
            serverIdStr,
            server.getName(),
            this.mapStatusToFrontend(server.getStatus()),
            "GUEST",
            server.getNodeId().toString(),
            `${server.getMemoryMb()} MB`,
            server.getPort(),
            ownerName
          )
        );
      }
    }

    if (accesses.length === 0) return response;

    const guestServerIds = accesses.map((a) => IdFactory.load<ServerId>(a.getServerId()));

    const guestServers = await this.serverRepository.findManyByIds(guestServerIds);

    const ownerIdsSet = new Set<string>();
    guestServers.forEach((server) => ownerIdsSet.add(server.getOwnerId().toString()));
    const ownerIds = Array.from(ownerIdsSet).map((id) => IdFactory.load<UserId>(id));

    const owners = ownerIds.length > 0 ? await this.userRepository.findManyByIds(ownerIds) : [];

    const ownerNameMap = new Map<string, string>();
    owners.forEach((owner) => ownerNameMap.set(owner.getId().toString(), owner.getName()));

    for (const server of guestServers) {
      const serverIdStr = server.getId().toString();

      if (processedServerIds.has(serverIdStr)) continue;

      const ownerIdStr = server.getOwnerId().toString();
      const ownerName = ownerNameMap.get(ownerIdStr) || "Unknown";

      response.push(
        new ServerResponseDto(
          serverIdStr,
          server.getName(),
          this.mapStatusToFrontend(server.getStatus()),
          "GUEST",
          server.getNodeId().toString(),
          `${server.getMemoryMb()} MB`,
          server.getPort(),
          ownerName
        )
      );
    }

    return response;
  }
}
