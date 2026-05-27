export enum UserRole {
  Admin = "ADMIN",
  User = "USER",
  Guest = "GUEST",
}

export class Role {
  private readonly value: UserRole;

  private constructor(value: UserRole) {
    this.value = value;
  }

  static create(roleString?: string): Role {
    const rawValue = (roleString || "USER").toUpperCase();

    if (!Object.values(UserRole).includes(rawValue as UserRole)) {
      throw new Error(`Invalid role: ${rawValue}`);
    }

    return new Role(rawValue as UserRole);
  }

  getValue(): string {
    return this.value;
  }
}
