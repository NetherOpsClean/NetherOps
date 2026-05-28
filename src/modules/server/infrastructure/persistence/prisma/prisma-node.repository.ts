import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../shared/infrastructure/database/prisma/prisma.service.js";
import { NodeRepository } from "../../../domain/repositories/node.repository.js";
import { Node } from "../../../domain/entities/node.entity.js";
import { NodeId } from "../../../domain/value-objects/id.vo.js";

@Injectable()
export class PrismaNodeRepository implements NodeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: NodeId): Promise<Node | null> {
    const record = await this.prisma.node.findUnique({
      where: { id: id.toString() },
    });
    return record ? this.toDomain(record) : null;
  }

  async findAll(): Promise<Node[]> {
    const records = await this.prisma.node.findMany();
    return records.map((r) => this.toDomain(r));
  }

  async save(node: Node): Promise<void> {
    const portRange = node.getPortRange();
    await this.prisma.node.upsert({
      where: { id: node.getId().toString() },
      update: {
        status: node.isDisabled() ? "DISABLED" : "ACTIVE",
      },
      create: {
        id: node.getId().toString(),
        alias: node.getAlias(),
        ipAddress: node.getIpAddress(),
        memoryCapacityMb: node.getMemoryCapacityMb(),
        portRangeStart: portRange.start,
        portRangeEnd: portRange.end,
        status: "ACTIVE",
      },
    });
  }

  async delete(id: NodeId): Promise<void> {
    await this.prisma.node.delete({
      where: { id: id.toString() },
    });
  }

  private toDomain(record: {
    id: string;
    alias: string;
    ipAddress: string;
    memoryCapacityMb: number;
    portRangeStart: number;
    portRangeEnd: number;
    status: string;
    createdAt: Date;
  }): Node {
    return Node.reconstitute(
      record.id,
      record.alias,
      record.ipAddress,
      record.memoryCapacityMb,
      record.portRangeStart,
      record.portRangeEnd,
      record.status as "ACTIVE" | "DISABLED",
      record.createdAt
    );
  }
}
