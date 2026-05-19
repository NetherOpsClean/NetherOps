import { UserRepository } from "../../domain/repositories/user.repository";
import { PasswordHash } from "../../domain/value-objects/password-hash.vo";
import { User } from "../../domain/entities/user.entity";
import { UserRole } from "../../domain/value-objects/user-role.vo";
import { Email } from "../../domain/value-objects/email.vo";
import { UserId } from "../../domain/value-objects/user-id.vo";
import { CreateUserDto } from "../dtos/create-user.dto";

export class CreateUserUseCase {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(dto: CreateUserDto): Promise<void> {
    const emailVo = new Email(dto.email);

    const existingUser = await this.userRepository.findByEmail(emailVo);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const userRole = UserRole[dto.role as keyof typeof UserRole];
    if (!userRole) {
      throw new Error(`Invalid role: ${dto.role}`);
    }

    const passwordVo = new PasswordHash(dto.password);

    const userId = UserId.generate();
    const newUser = new User(userId, emailVo, passwordVo, userRole);
    await this.userRepository.save(newUser);
  }
}
