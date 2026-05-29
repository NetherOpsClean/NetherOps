export type AccessRole = "OPERATOR";

export class ServerAccess {
  private constructor(
    private readonly id: string,
    private readonly serverId: string,
    private readonly userId: string,
    private readonly role: AccessRole,
    private readonly createdAt: Date
  ) {}

  static create(serverId: string, userId: string): ServerAccess {
    return new ServerAccess(crypto.randomUUID(), serverId, userId, "OPERATOR", new Date());
  }

  static reconstitute(
    id: string,
    serverId: string,
    userId: string,
    role: AccessRole,
    createdAt: Date
  ): ServerAccess {
    return new ServerAccess(id, serverId, userId, role, createdAt);
  }

  getId(): string {
    return this.id;
  }
  getServerId(): string {
    return this.serverId;
  }
  getUserId(): string {
    return this.userId;
  }
  getRole(): AccessRole {
    return this.role;
  }
  getCreatedAt(): Date {
    return this.createdAt;
  }
}
