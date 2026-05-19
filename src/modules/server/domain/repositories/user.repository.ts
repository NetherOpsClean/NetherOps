import { Email } from "../value-objects/email.vo";
import { User } from "../entities/user.entity";

export interface UserRepository {
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<User>;
  findAll(): Promise<User[]>;
}
