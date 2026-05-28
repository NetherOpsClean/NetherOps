import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/infrastructure/database/prisma/prisma.service.js";
import { ServerRepository } from "../../../domain/repositories/server.repository.js";
import { Server } from "../../../domain/entities/server.entity.js";
import {
  ServerId,
  NodeId,
  UserId,
  TemplateId,
  IdFactory,
} from "../../../domain/value-objects/id.vo.js";
import { MemoryLimit } from "../../../domain/value-objects/memory-limit.vo.js";
import { ServerConfiguration } from "../../../domain/value-objects/server-configuration.vo.js";

@Injectable()
export class PrismaServerRepository implements ServerRepository {
  constructor(private readonly prisma: PrismaService) {}

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
        diskLimitMb: server.getDiskLimitMb(),
        allocatedPort: server.getPort(),
      },
      create: {
        id: server.getId().toString(),
        name: server.getName(),
        ownerId: server.getOwnerId().toString(),
        nodeId: server.getNodeId().toString(),
        templateId: server.getTemplateId().toString(),
        memoryLimitMb: server.getMemoryMb(),
        diskLimitMb: server.getDiskLimitMb(),
        allocatedPort: server.getPort(),
        status: server.getStatus(),
        maxPlayers: server.getConfiguration().maxPlayers,
        gameMode: server.getConfiguration().gameMode,
        difficulty: server.getConfiguration().difficulty,
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
    diskLimitMb: number;
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
      record.diskLimitMb,
      record.status as Server["status"],
      record.allocatedPort,
      ServerConfiguration.create(
        record.maxPlayers,
        record.gameMode,
        record.difficulty,
        record.pvpEnabled,
        record.motd,
        record.cracked
      ),
      record.createdAt
    );
  }
}
