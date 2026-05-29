export class StopServerDto {
  constructor(
    public readonly serverId: string,
    public readonly requesterId: string
  ) {}
}
