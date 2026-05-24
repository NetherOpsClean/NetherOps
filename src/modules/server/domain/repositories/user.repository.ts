import { Email } from "../value-objects/email.vo";
import { User } from "../entities/user.entity";
import { UserId } from "../../shared/domain/value-objects/id.vo";

export interface UserRepository {
  findByEmail(email: Email): Promise<User | null>;
  findById(id: UserId): Promise<User | null>;
  save(user: User): Promise<User>;
  findAll(): Promise<User[]>;
}
