import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import type { ServerRepository } from "../../domain/repositories/server.repository.js";
import type { UserRepository } from "../repositories/user.repository.js";
import type { ServerAccessRepository } from "../../domain/repositories/server-access.repository.js";
import { SERVER_REPOSITORY } from "../../domain/repositories/server.repository.js";
import { USER_REPOSITORY } from "../repositories/user.repository.js";
import { SERVER_ACCESS_REPOSITORY } from "../../domain/repositories/server-access.repository.js";
import { ServerAccess } from "../../domain/entities/server-access.entity.js";
import { IdFactory, ServerId } from "../value-objects/id.vo.js";
import { AddUserToServerDto } from "../dtos/add-to-server.dto.js";
import { Email } from "../value-objects/email.vo.js";

@Injectable()
export class AddUserToServerUseCase {
  constructor(
    @Inject(SERVER_REPOSITORY)
    private readonly serverRepository: ServerRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(SERVER_ACCESS_REPOSITORY)
    private readonly serverAccessRepository: ServerAccessRepository
  ) {}

  async execute(dto: AddUserToServerDto): Promise<void> {
    const serverId = IdFactory.load<ServerId>(dto.serverId);
    const server = await this.serverRepository.findById(serverId);
    if (!server) throw new NotFoundException("Server not found");

    if (server.getOwnerId().toString() !== dto.ownerId) {
      throw new ForbiddenException("Only the owner can add users to this server");
    }

    const guestEmailVO = Email.create(dto.guestEmail);
    const guest = await this.userRepository.findByEmail(guestEmailVO);

    if (!guest) {
      throw new NotFoundException("No se encontró ningún usuario con este correo electrónico");
    }

    const guestId = guest.getId();

    if (dto.ownerId === guestId.toString()) {
      throw new ForbiddenException("Owner already has full access to this server");
    }

    const existingAccess = await this.serverAccessRepository.findByServerAndUser(serverId, guestId);
    if (existingAccess) {
      throw new ConflictException("User already has access to this server");
    }

    const access = ServerAccess.create(serverId, guestId);
    await this.serverAccessRepository.save(access);
  }
}
