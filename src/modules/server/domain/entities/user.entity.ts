import { Email } from "../value-objects/email.vo";
import { PasswordHash } from "../value-objects/password-hash.vo";
import { UserId } from "../value-objects/user-id.vo";
import { UserRole } from "../value-objects/user-role.vo";

export class User {
  private readonly userId: UserId;
  private email: Email;
  private password: PasswordHash;
  private role: UserRole;

  constructor(userId: UserId, email: Email, password: PasswordHash, role: UserRole) {
    this.userId = userId;
    this.email = email;
    this.password = password;
    this.role = role;
  }

  static create(email: Email, password: PasswordHash, role: UserRole): User {
    const userId = UserId.generate();
    return new User(userId, email, password, role);
  }

  getId(): UserId {
    return this.userId;
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
