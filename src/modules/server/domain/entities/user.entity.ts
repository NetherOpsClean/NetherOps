import { Password } from "../value-objects/password.vo.js";

export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public readonly password: Password,
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

  getPassword(): Password {
    return this.password;
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
    return new User(id, name, email, Password.create("defaultPassword"));
  }
}
