import { ServerId, NodeId } from "../../shared/domain/value-objects/id.vo";
import { Server } from "../entities/server.entity";

export interface ServerRepository {
  findById(id: ServerId): Promise<Server | null>;
  findAllByOwner(ownerId: string): Promise<Server[]>;
  findActiveByNodeId(nodeId: NodeId): Promise<Server[]>;
  save(server: Server): Promise<void>;
  delete(id: ServerId): Promise<void>;
}
