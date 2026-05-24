import { NodeId } from "../../shared/domain/value-objects/id.vo";
import { Node } from "../entities/node.entity";

export interface NodeRepository {
  findById(id: NodeId): Promise<Node | null>;
  findAll(): Promise<Node[]>;
  save(node: Node): Promise<void>;
  delete(id: NodeId): Promise<void>;
}
