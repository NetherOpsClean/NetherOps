import { CreateUserUseCase } from "./create-user.use-case.js";
import { UserRepository } from "../../domain/repositories/user.repository.js";
import { PasswordHasherPort } from "../ports/password-hasher.port.js";
import { CreateUserDto } from "../dtos/create-user.dto.js";
import { User } from "../entities/user.entity.js";
import { Role } from "../../domain/value-objects/user-role.vo.js";
import { Password } from "../value-objects/password-hash.vo.js";
import { jest } from "@jest/globals";

describe("CreateUserUseCase", () => {
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let passwordHasher: jest.Mocked<PasswordHasherPort>;

  const validDto: CreateUserDto = {
    name: "Hector Barrera",
    email: "hector@netherops.com",
    password: "$2a$12$R9h/cIPz0gi.URNNX3rubedAK0UVXvdWGva8K.Ro9UcjOOM0a0ZfO",
    role: "USER",
  };

  const existingUser = User.create(
    "user-existing",
    "Existing User",
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

    useCase = new CreateUserUseCase(userRepository, passwordHasher);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should create and save a user successfully", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      passwordHasher.hash.mockResolvedValue(
        "$2a$12$R9h/cIPz0gi.URNNX3rubedAK0UVXvdWGva8K.Ro9UcjOOM0a0ZfO"
      );

      await useCase.execute(validDto);

      expect(userRepository.save).toHaveBeenCalledTimes(1);
    });

    it("should hash the password before saving", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      passwordHasher.hash.mockResolvedValue(
        "$2a$12$R9h/cIPz0gi.URNNX3rubedAK0UVXvdWGva8K.Ro9UcjOOM0a0ZfO"
      );

      await useCase.execute(validDto);

      expect(passwordHasher.hash).toHaveBeenCalledWith(validDto.password);
    });

    it("should save a user with the correct name and email", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      passwordHasher.hash.mockResolvedValue(
        "$2a$12$R9h/cIPz0gi.URNNX3rubedAK0UVXvdWGva8K.Ro9UcjOOM0a0ZfO"
      );

      await useCase.execute(validDto);

      const savedUser: User = userRepository.save.mock.calls[0][0] as User;
      expect(savedUser.getName()).toBe("Hector Barrera");
      expect(savedUser.getEmail()).toBe("hector@netherops.com");
    });

    it("should save a user with the correct role", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      passwordHasher.hash.mockResolvedValue(
        "$2a$12$R9h/cIPz0gi.URNNX3rubedAK0UVXvdWGva8K.Ro9UcjOOM0a0ZfO"
      );

      await useCase.execute({ ...validDto, role: "ADMIN" });

      const savedUser: User = userRepository.save.mock.calls[0][0] as User;
      expect(savedUser.getRole()).toBe("ADMIN");
    });

    it("should generate a unique id for each user", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      passwordHasher.hash.mockResolvedValue(
        "$2a$12$R9h/cIPz0gi.URNNX3rubedAK0UVXvdWGva8K.Ro9UcjOOM0a0ZfO"
      );

      await useCase.execute(validDto);
      await useCase.execute({ ...validDto, email: "other@netherops.com" });

      const firstUser: User = userRepository.save.mock.calls[0][0] as User;
      const secondUser: User = userRepository.save.mock.calls[1][0] as User;
      expect(firstUser.getId()).not.toBe(secondUser.getId());
    });

    it("should throw if a user with the same email already exists", async () => {
      userRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(useCase.execute(validDto)).rejects.toThrow(
        "User with this email already exists"
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it("should not hash password if email already exists", async () => {
      userRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(useCase.execute(validDto)).rejects.toThrow();

      expect(passwordHasher.hash).not.toHaveBeenCalled();
    });
  });
});
