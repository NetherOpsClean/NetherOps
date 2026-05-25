import { RegisterNodeDto } from "../dtos/register-node.dto.js";
import { NodeRepository } from "../../domain/repositories/node.repository.js";
import { ServerRepository } from "../../domain/repositories/server.repository.js";
import { Node } from "../../domain/entities/node.entity.js";
import { PortRange } from "../../domain/value-objects/port-range.vo.js";

export class RegisterNodeUseCase {
  constructor(
    private readonly nodeRepository: NodeRepository,
    private readonly serverRepository: ServerRepository
  ) {}

  async execute(dto: RegisterNodeDto): Promise<void> {
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
  }
}
