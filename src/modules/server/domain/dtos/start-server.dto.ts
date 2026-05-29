export class StartServerDto {
  readonly serverId: string;
  readonly requesterId: string;

  constructor(serverId: string, requesterId: string) {
    this.serverId = serverId;
    this.requesterId = requesterId;
  }
}
