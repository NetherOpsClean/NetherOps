import type { NodeRepository } from "../../domain/repositories/node.repository.js";
import { NODE_REPOSITORY } from "../repositories/node.repository.js";
import { IdFactory, NodeId } from "../value-objects/id.vo.js";
import { DeleteNodeDto } from "../dtos/delete-node.dto.js";
import { Injectable, Inject } from "@nestjs/common";

@Injectable()
export class DisableNodeUseCase {
  constructor(
    @Inject(NODE_REPOSITORY)
    private readonly nodeRepository: NodeRepository
  ) {}

  async execute(dto: DeleteNodeDto): Promise<void> {
    const nodeId = IdFactory.load<NodeId>(dto.nodeId);
    const node = await this.nodeRepository.findById(nodeId);
    if (!node) {
      throw new Error("Node not found");
    }

    node.disable();

    await this.nodeRepository.save(node);
  }
}
