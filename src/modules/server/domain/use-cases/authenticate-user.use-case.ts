import { Injectable, Inject } from "@nestjs/common";
import { AuthenticateUserDto } from "../dtos/authenticate-user.dto.js";
import { USER_REPOSITORY } from "../repositories/user.repository.js";
import type { UserRepository } from "../repositories/user.repository.js";
import { PASSWORD_HASHER } from "../ports/password-hasher.port.js";
import type { PasswordHasherPort } from "../ports/password-hasher.port.js";
import { TOKEN_PROVIDER } from "../ports/token-provider.port.js";
import type { TokenProviderPort } from "../ports/token-provider.port.js";
import { Email } from "../value-objects/email.vo.js";

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,
    @Inject(TOKEN_PROVIDER)
    private readonly tokenProvider: TokenProviderPort
  ) {}

  async execute(dto: AuthenticateUserDto): Promise<{ accessToken: string }> {
    const AUTH_ERROR = "Invalid Credentials";

    const emailVo = Email.create(dto.email);

    const user = await this.userRepository.findByEmail(emailVo);
    if (!user) {
      throw new Error(AUTH_ERROR);
    }

    const isPasswordValid = await this.passwordHasher.compare(
      dto.password,
      user.getPassword().toString()
    );

    if (!isPasswordValid) {
      throw new Error(AUTH_ERROR);
    }

    const accessToken = await this.tokenProvider.generateToken({
      sub: user.getId(),
      role: user.getRole(),
    });

    return { accessToken };
  }
}
