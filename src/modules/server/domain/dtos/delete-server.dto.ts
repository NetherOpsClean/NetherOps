export class DeleteServerDto {
  serverId: string;
  requesterId: string;

  constructor(serverId: string, requesterId: string) {
    this.serverId = serverId;
    this.requesterId = requesterId;
  }
}
