// src/modules/users/infrastructure/persistence/in-memory-user.repository.ts
import { UserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.entity";
import { Email } from "../../domain/value-objects/email.vo";

export class InMemoryUserRepository implements UserRepository {
  // Simulamos la base de datos con un arreglo en memoria
  private readonly users: User[] = [];

  async save(user: User): Promise<User> {
    // Simulamos la auto-generación de un ID si no lo tiene
    this.users.push(user);
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const user = this.users.find((u) => u.getEmail().value === email.value);
    return user || null;
  }
}
