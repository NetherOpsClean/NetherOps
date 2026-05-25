import { UserRepository } from "../../domain/repositories/user.repository.js";

import { UserRole } from "../../domain/value-objects/user-role.vo.js";
import { Email } from "../../domain/value-objects/email.vo.js";
import { CreateUserDto } from "../dtos/create-user.dto.js";

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
  }
}
