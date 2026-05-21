import { Email } from "../value-objects/email.vo";
import { PasswordHash } from "../value-objects/password-hash.vo";
import { UserId, IdFactory } from "../../shared/domain/value-objects/id.vo";
import { UserRole } from "../value-objects/user-role.vo";

export class User {
  private readonly id: UserId;
  private email: Email;
  private password: PasswordHash;
  private role: UserRole;

  constructor(id: UserId, email: Email, password: PasswordHash, role: UserRole) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.role = role;
  }

  static create(email: Email, password: PasswordHash, role: UserRole): User {
    const userId = IdFactory.generate<UserId>();
    return new User(userId, email, password, role);
  }

  getId(): UserId {
    return this.id;
  }

  getEmail(): Email {
    return this.email;
  }

  getPassword(): PasswordHash {
    return this.password;
  }

  getRole(): UserRole {
    return this.role;
  }

  changeEmail(newEmail: Email): void {
    this.email = newEmail;
  }

  changePassword(newPassword: PasswordHash): void {
    this.password = newPassword;
  }

  changeRole(newRole: UserRole): void {
    this.role = newRole;
  }
}
