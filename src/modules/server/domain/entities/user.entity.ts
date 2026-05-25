import { Password } from "../value-objects/password-hash.vo.js";
import { ResourceQuota } from "../value-objects/resource-quota.vo.js";

export class User {
  constructor(
    private readonly id: string,
    private name: string,
    private email: string,
    private readonly role: string,
    private readonly quota: ResourceQuota,
    private readonly password: Password,
    private readonly createdAt: Date = new Date()
  ) {}

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email;
  }

  isAdmin(): boolean {
    return this.role === "ADMIN";
  }

  getRole(): string {
    return this.role;
  }

  getPassword(): Password {
    return this.password;
  }

  getQuota(): ResourceQuota {
    return this.quota;
  }

  updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error("Name cannot be empty");
    }

    this.name = newName;
  }

  static create(id: string, name: string, email: string): User {
    if (!email.includes("@")) {
      throw new Error("Invalid email");
    }
    return new User(
      id,
      name,
      email,
      "USER", // Default role
      ResourceQuota.create(1024),
      Password.create("defaultPassword")
    );
  }
}
