import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/infrastructure/database/prisma/prisma.service.js";
import { ServerRepository } from "../../../domain/repositories/server.repository.js";
import { Server } from "../../../domain/entities/server.entity.js";
import { GameMode, Difficulty } from "../../../domain/value-objects/configuration.enum.js";
import {
  ServerId,
  NodeId,
  UserId,
  TemplateId,
  IdFactory,
} from "../../../domain/value-objects/id.vo.js";
import { MemoryLimit } from "../../../domain/value-objects/memory-limit.vo.js";
import { ServerConfiguration } from "../../../domain/value-objects/server-configuration.vo.js";
import { ServerStatus } from "../../../domain/entities/server.entity.js";
import { Server as PrismaServerModel } from "@prisma/client";

@Injectable()
export class PrismaServerRepository implements ServerRepository {
  constructor(private readonly prisma: PrismaService) {}

  sumAllocatedMemoryByNodeId(nodeId: NodeId): Promise<number> {
    return this.prisma.server
      .aggregate({
        where: {
          nodeId: nodeId.toString(),
          status: { in: ["RUNNING", "STARTING", "STOPPING"] },
        },
        _sum: {
          memoryLimitMb: true,
        },
      })
      .then((result) => result._sum.memoryLimitMb ?? 0);
  }

  findActivePortsByNodeId(nodeId: NodeId): Promise<number[]> {
    return this.prisma.server
      .findMany({
        where: {
          nodeId: nodeId.toString(),
          status: { in: ["RUNNING", "STARTING", "STOPPING"] },
        },
        select: {
          allocatedPort: true,
        },
      })
      .then((servers) => servers.map((s) => s.allocatedPort));
  }

  async findById(id: ServerId): Promise<Server | null> {
    const record = await this.prisma.server.findUnique({
      where: { id: id.toString() },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findAllByOwner(ownerId: string): Promise<Server[]> {
    const records = await this.prisma.server.findMany({
      where: { ownerId },
    });
    return records.map((r) => this.toDomain(r));
  }

  async findActiveByNodeId(nodeId: NodeId): Promise<Server[]> {
    const records = await this.prisma.server.findMany({
      where: {
        nodeId: nodeId.toString(),
        status: { in: ["RUNNING", "STARTING", "STOPPING"] },
      },
    });
    return records.map((r) => this.toDomain(r));
  }

  async save(server: Server): Promise<void> {
    await this.prisma.server.upsert({
      where: { id: server.getId().toString() },
      update: {
        status: server.getStatus(),
        memoryLimitMb: server.getMemoryMb(),
        allocatedPort: server.getPort(),
      },
      create: {
        id: server.getId().toString(),
        name: server.getName(),
        ownerId: server.getOwnerId().toString(),
        nodeId: server.getNodeId().toString(),
        templateId: server.getTemplateId().toString(),
        memoryLimitMb: server.getMemoryMb(),
        allocatedPort: server.getPort(),
        status: server.getStatus(),
        maxPlayers: server.getConfiguration().maxPlayers,
        gameMode: server.getConfiguration().gameMode as GameMode,
        difficulty: server.getConfiguration().difficulty as Difficulty,
        pvpEnabled: server.getConfiguration().pvpEnabled,
        motd: server.getConfiguration().motd,
        cracked: server.getConfiguration().cracked,
      },
    });
  }

  async delete(id: ServerId): Promise<void> {
    await this.prisma.server.delete({
      where: { id: id.toString() },
    });
  }

  private toDomain(record: {
    id: string;
    name: string;
    ownerId: string;
    nodeId: string;
    templateId: string;
    memoryLimitMb: number;
    allocatedPort: number;
    status: string;
    maxPlayers: number;
    gameMode: string;
    difficulty: string;
    pvpEnabled: boolean;
    motd: string;
    cracked: boolean;
    createdAt: Date;
  }): Server {
    return Server.reconstitute(
      record.id,
      record.name,
      IdFactory.load<UserId>(record.ownerId),
      IdFactory.load<NodeId>(record.nodeId),
      IdFactory.load<TemplateId>(record.templateId),
      MemoryLimit.create(record.memoryLimitMb),
      record.status as Server["status"],
      record.allocatedPort,
      ServerConfiguration.create(
        record.maxPlayers,
        record.gameMode as GameMode,
        record.difficulty as Difficulty,
        record.pvpEnabled,
        record.motd,
        record.cracked
      ),
      record.createdAt
    );
  }

  async findManyByIds(ids: ServerId[]): Promise<Server[]> {
    if (!ids || ids.length === 0) {
      return [] as Server[];
    }

    const prismaServers = await this.prisma.server.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return prismaServers.map((model) => this.mapToDomain(model));
  }

  private mapToDomain(prismaModel: PrismaServerModel): Server {
    return Server.reconstitute(
      prismaModel.id,
      prismaModel.name,
      IdFactory.load<UserId>(prismaModel.ownerId),
      IdFactory.load<NodeId>(prismaModel.nodeId),
      IdFactory.load<TemplateId>(prismaModel.templateId),
      MemoryLimit.create(prismaModel.memoryLimitMb),
      prismaModel.status as ServerStatus,
      prismaModel.allocatedPort,
      ServerConfiguration.create(
        prismaModel.maxPlayers,
        prismaModel.gameMode as GameMode,
        prismaModel.difficulty as Difficulty,
        prismaModel.pvpEnabled,
        prismaModel.motd,
        prismaModel.cracked
      ),
      prismaModel.createdAt
    );
  }
}
