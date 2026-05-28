import { RegisterNodeDto } from "../dtos/register-node.dto.js";
import type { NodeRepository } from "../../domain/repositories/node.repository.js";
import { Node } from "../../domain/entities/node.entity.js";
import { PortRange } from "../../domain/value-objects/port-range.vo.js";
import { Injectable, Inject } from "@nestjs/common";
import { NODE_REPOSITORY } from "../repositories/node.repository.js";

@Injectable()
export class RegisterNodeUseCase {
  constructor(
    @Inject(NODE_REPOSITORY)
    private readonly nodeRepository: NodeRepository
  ) {}

  async execute(dto: RegisterNodeDto): Promise<Node> {
    const existingNodes = await this.nodeRepository.findAll();
    if (existingNodes.some((node) => node.getIpAddress() === dto.ipAddress)) {
      throw new Error("A node with this IP address already exists");
    }

    const portRange = PortRange.create(dto.portRangeStart, dto.portRangeEnd);
    if (existingNodes.some((node) => node.getPortRange().overlapsWith(portRange))) {
      throw new Error("The port range overlaps with an existing node");
    }

    const newNode = Node.create(
      dto.alias,
      dto.ipAddress,
      dto.memoryCapacityMb,
      portRange,
      dto.totalDiskMb
    );

    await this.nodeRepository.save(newNode);
    return newNode;
  }
}
