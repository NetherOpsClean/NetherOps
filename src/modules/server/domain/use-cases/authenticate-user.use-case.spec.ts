import { AuthenticateUserUseCase } from "./authenticate-user.use-case.js";
import { UserRepository } from "../repositories/user.repository.js";
import { PasswordHasherPort } from "../ports/password-hasher.port.js";
import { TokenProviderPort } from "../ports/token-provider.port.js";
import { User } from "../entities/user.entity.js";
import { Role } from "../value-objects/user-role.vo.js";
import { Password } from "../value-objects/password-hash.vo.js";
import { jest } from "@jest/globals";

describe("AuthenticateUserUseCase", () => {
  let useCase: AuthenticateUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let passwordHasher: jest.Mocked<PasswordHasherPort>;
  let tokenProvider: jest.Mocked<TokenProviderPort>;

  const validDto = {
    email: "hector@netherops.com",
    password: "$2a$12$R9h/cIPz0gi.URNNX3rubedAK0UVXvdWGva8K.Ro9UcjOOM0a0ZfO",
  };

  const mockUser = User.create(
    "user-123",
    "Hector Barrera",
    "hector@netherops.com",
    Role.create("USER"),
    Password.create("$2a$12$R9h/cIPz0gi.URNNX3rubedAK0UVXvdWGva8K.Ro9UcjOOM0a0ZfO")
  );

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    passwordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as unknown as jest.Mocked<PasswordHasherPort>;

    tokenProvider = {
      generateToken: jest.fn(),
    } as unknown as jest.Mocked<TokenProviderPort>;

    useCase = new AuthenticateUserUseCase(userRepository, passwordHasher, tokenProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should return an accessToken when credentials are valid", async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordHasher.compare.mockResolvedValue(true);
      tokenProvider.generateToken.mockResolvedValue("jwt-token-abc");

      const result = await useCase.execute(validDto);

      expect(result.accessToken).toBe("jwt-token-abc");
    });

    it("should call findByEmail with the correct email", async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordHasher.compare.mockResolvedValue(true);
      tokenProvider.generateToken.mockResolvedValue("token");

      await useCase.execute(validDto);

      expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
    });

    it("should call generateToken with userId and role", async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordHasher.compare.mockResolvedValue(true);
      tokenProvider.generateToken.mockResolvedValue("token");

      await useCase.execute(validDto);

      expect(tokenProvider.generateToken).toHaveBeenCalledWith({
        sub: mockUser.getId(),
        role: mockUser.getRole(),
      });
    });

    it("should throw 'Invalid Credentials' when user does not exist", async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.execute(validDto)).rejects.toThrow("Invalid Credentials");
      expect(tokenProvider.generateToken).not.toHaveBeenCalled();
    });

    it("should throw 'Invalid Credentials' when password is wrong", async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordHasher.compare.mockResolvedValue(false);

      await expect(useCase.execute(validDto)).rejects.toThrow("Invalid Credentials");
      expect(tokenProvider.generateToken).not.toHaveBeenCalled();
    });

    it("should return the same error for wrong user and wrong password", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      const errorUserNotFound = useCase.execute({
        email: "x@x.com",
        password: "$2a$12$R9h/cIPz0gi.URNNX3rubedAK0UVXvdWGva8K.Ro9UcjOOM0a0ZfO",
      });

      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordHasher.compare.mockResolvedValue(false);
      const errorWrongPass = useCase.execute(validDto);

      await expect(errorUserNotFound).rejects.toThrow("Invalid Credentials");
      await expect(errorWrongPass).rejects.toThrow("Invalid Credentials");
    });
  });
});
