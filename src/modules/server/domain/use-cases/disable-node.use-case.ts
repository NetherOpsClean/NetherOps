import type { NodeRepository } from "../../domain/repositories/node.repository.js";
import type { ServerRepository } from "../../domain/repositories/server.repository.js";
import { NODE_REPOSITORY } from "../repositories/node.repository.js";
import { SERVER_REPOSITORY } from "../repositories/server.repository.js";
import { IdFactory, NodeId } from "../value-objects/id.vo.js";
import { DeleteNodeDto } from "../dtos/delete-node.dto.js";
import { Injectable, Inject } from "@nestjs/common";
import { type ContainerProvider, CONTAINER_PROVIDER } from "../ports/container.provider.js";

@Injectable()
export class DisableNodeUseCase {
  constructor(
    @Inject(NODE_REPOSITORY)
    private readonly nodeRepository: NodeRepository,
    @Inject(SERVER_REPOSITORY)
    private readonly serverRepository: ServerRepository,
    @Inject(CONTAINER_PROVIDER)
    private readonly containerProvider: ContainerProvider
  ) {}

  async execute(dto: DeleteNodeDto): Promise<void> {
    const nodeId = IdFactory.load<NodeId>(dto.nodeId);
    const node = await this.nodeRepository.findById(nodeId);
    if (!node) {
      throw new Error("Node not found");
    }

    node.disable();

    const activeServers = await this.serverRepository.findActiveByNodeId(nodeId);
    for (const server of activeServers) {
      server.stop();
      await this.containerProvider.stop(server.getId().toString());
    }

    await this.nodeRepository.save(node);
  }
}
