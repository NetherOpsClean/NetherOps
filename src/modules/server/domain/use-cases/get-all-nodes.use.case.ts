import { Injectable, Inject } from "@nestjs/common";
import { type NodeRepository } from "../repositories/node.repository.js";
import { Node } from "../entities/node.entity.js";
import { NODE_REPOSITORY } from "../repositories/node.repository.js";

@Injectable()
export class GetAllNodesUseCase {
  constructor(
    @Inject(NODE_REPOSITORY)
    private readonly nodeRepository: NodeRepository
  ) {}

  async execute(): Promise<Node[]> {
    return this.nodeRepository.findAll();
  }
}
