import { Email } from "../value-objects/email.vo.js";
import { User } from "../entities/user.entity.js";
import { UserId } from "../value-objects/id.vo.js";

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

export interface UserRepository {
  findByEmail(email: Email): Promise<User | null>;
  findById(id: UserId): Promise<User | null>;
  save(user: User): Promise<User>;
  findAll(): Promise<User[]>;
}
