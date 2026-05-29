import { Injectable, Inject } from "@nestjs/common";
import { USER_REPOSITORY } from "../../domain/repositories/user.repository.js";
import type { UserRepository } from "../../domain/repositories/user.repository.js";
import { UserId, IdFactory } from "../../domain/value-objects/id.vo.js";
import { GetUserProfileResponseDto } from "../dtos/get-user-profile-response.dto.js";

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  async execute(userId: string): Promise<GetUserProfileResponseDto> {
    const user = await this.userRepository.findById(IdFactory.load<UserId>(userId));

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      role: user.getRole(),

      quotas: {
        memoryMb: user.getQuota().getValue(),
      },
    };
  }
}
