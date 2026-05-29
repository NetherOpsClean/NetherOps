export class ServerResponseDto {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly status: "online" | "offline" | "starting",
    public readonly role: "OWNER" | "GUEST",
    public readonly node: string,
    public readonly memory: string,
    public readonly port: number,
    public readonly ownerName?: string
  ) {}
}
