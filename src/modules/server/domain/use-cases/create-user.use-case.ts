import { type UserRepository } from "../../domain/repositories/user.repository.js";
import { Injectable, Inject } from "@nestjs/common";
import { Role } from "../../domain/value-objects/user-role.vo.js";
import { Email } from "../../domain/value-objects/email.vo.js";
import { CreateUserDto } from "../dtos/create-user.dto.js";
import { type PasswordHasherPort } from "../ports/password-hasher.port.js";
import { Password } from "../value-objects/password-hash.vo.js";
import { User } from "../entities/user.entity.js";
import { USER_REPOSITORY } from "../../domain/repositories/user.repository.js";
import { PASSWORD_HASHER } from "../../domain/ports/password-hasher.port.js";

@Injectable()
export class CreateUserUseCase {
  @Inject(USER_REPOSITORY)
  private userRepository: UserRepository;
  @Inject(PASSWORD_HASHER)
  private passwordHasher: PasswordHasherPort;

  constructor(userRepository: UserRepository, passwordHasher: PasswordHasherPort) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
  }

  async execute(dto: CreateUserDto): Promise<void> {
    const emailVo = Email.create(dto.email);

    const existingUser = await this.userRepository.findByEmail(emailVo);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const hashedPasswordString = await this.passwordHasher.hash(dto.password);
    const passwordVo = Password.create(hashedPasswordString);
    const roleVo = Role.create(dto.role);

    const newUser = User.create(crypto.randomUUID(), dto.name, dto.email, roleVo, passwordVo);

    await this.userRepository.save(newUser);
  }
}
