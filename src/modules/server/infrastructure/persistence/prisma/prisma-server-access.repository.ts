import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/infrastructure/database/prisma/prisma.service.js";
import { ServerAccessRepository } from "../../../domain/repositories/server-access.repository.js";
import { ServerAccess, AccessRole } from "../../../domain/entities/server-access.entity.js";

@Injectable()
export class PrismaServerAccessRepository implements ServerAccessRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUser(userId: string): Promise<ServerAccess[]> {
    return this.prisma.serverAccess
      .findMany({
        where: { userId },
      })
      .then((records) => records.map((r) => this.toDomain(r)));
  }

  async save(access: ServerAccess): Promise<void> {
    await this.prisma.serverAccess.create({
      data: {
        id: access.getId(),
        serverId: access.getServerId(),
        userId: access.getUserId(),
        role: access.getRole(),
      },
    });
  }

  async findByServerAndUser(serverId: string, userId: string): Promise<ServerAccess | null> {
    const record = await this.prisma.serverAccess.findUnique({
      where: {
        serverId_userId: { serverId, userId },
      },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findAllByServer(serverId: string): Promise<ServerAccess[]> {
    const records = await this.prisma.serverAccess.findMany({
      where: { serverId },
    });
    return records.map((r) => this.toDomain(r));
  }

  async delete(serverId: string, userId: string): Promise<void> {
    await this.prisma.serverAccess.delete({
      where: {
        serverId_userId: { serverId, userId },
      },
    });
  }

  private toDomain(record: {
    id: string;
    serverId: string;
    userId: string;
    role: string;
    createdAt: Date;
  }): ServerAccess {
    return ServerAccess.reconstitute(
      record.id,
      record.serverId,
      record.userId,
      record.role as AccessRole,
      record.createdAt
    );
  }
}
