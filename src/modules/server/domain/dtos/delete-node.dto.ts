export class DeleteNodeDto {
  nodeId: string;
  requesterId: string;

  constructor(nodeId: string, requesterId: string) {
    this.nodeId = nodeId;
    this.requesterId = requesterId;
  }
}
