import { NodeRepository } from "../../domain/repositories/node.repository";
import { ServerRepository } from "../../domain/repositories/server.repository";
import { IdFactory, NodeId } from "../../shared/domain/value-objects/id.vo";
import { DeleteNodeDto } from "../dtos/delete-node.dto";

export class DisableNodeUseCase {
  constructor(
    private readonly nodeRepository: NodeRepository,
    private readonly serverRepository: ServerRepository
  ) {}

  async execute(dto: DeleteNodeDto): Promise<void> {
    const nodeId = IdFactory.load<NodeId>(dto.nodeId);
    const node = await this.nodeRepository.findById(nodeId);
    if (!node) {
      throw new Error("Node not found");
    }

    node.disable();
    await this.nodeRepository.save(node);

    const activeServers = await this.serverRepository.findActiveByNodeId(nodeId);
    for (const server of activeServers) {
      server.stop();
      await this.serverRepository.save(server);
    }

    await this.nodeRepository.save(node);
  }
}
