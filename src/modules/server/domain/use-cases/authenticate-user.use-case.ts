import { AuthenticateUserDto } from "../dtos/authenticate-user.dto.js";
import { PasswordHasherPort } from "../ports/password-hasher.port.js";
import { TokenProviderPort } from "../ports/token-provider.port.js";
import { UserRepository } from "../repositories/user.repository.js";
import { Email } from "../value-objects/email.vo.js";

export class AuthenticateUserUseCase {
  private userRepository: UserRepository;
  private passwordHasher: PasswordHasherPort;
  private tokenProvider: TokenProviderPort;

  constructor(
    userRepository: UserRepository,
    passwordHasher: PasswordHasherPort,
    tokenProvider: TokenProviderPort
  ) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenProvider = tokenProvider;
  }

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
