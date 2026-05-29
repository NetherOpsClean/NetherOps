import { ServerId, NodeId, UserId } from "../value-objects/id.vo.js";
import { Server } from "../entities/server.entity.js";

export const SERVER_REPOSITORY = Symbol("SERVER_REPOSITORY");

export interface ServerRepository {
  findById(id: ServerId): Promise<Server | null>;
  findManyByIds(ids: ServerId[]): Promise<Server[]>;
  findAllByOwner(ownerId: UserId): Promise<Server[]>;
  findActiveByNodeId(nodeId: NodeId): Promise<Server[]>;
  sumAllocatedMemoryByNodeId(nodeId: NodeId): Promise<number>;
  findActivePortsByNodeId(nodeId: NodeId): Promise<number[]>;
  save(server: Server): Promise<void>;
  delete(id: ServerId): Promise<void>;
}
