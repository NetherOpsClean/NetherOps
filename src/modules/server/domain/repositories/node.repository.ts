import { NodeId } from "../value-objects/id.vo.js";
import { Node } from "../entities/node.entity.js";

export interface NodeRepository {
  findById(id: NodeId): Promise<Node | null>;
  findAll(): Promise<Node[]>;
  save(node: Node): Promise<void>;
  delete(id: NodeId): Promise<void>;
}
