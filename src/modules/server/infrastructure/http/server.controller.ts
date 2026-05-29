import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  Res,
  HttpStatus,
  Inject,
  UseGuards,
} from "@nestjs/common";
import { type Response } from "express";
import { CreateServerUseCase } from "../../domain/use-cases/create-server.use-case.js";
import { DeleteServerUseCase } from "../../domain/use-cases/delete-server.use-case.js";
import { AddUserToServerUseCase } from "../../domain/use-cases/add-user-to-server.use-case.js";
import { CreateServerDto } from "../../domain/dtos/create-server.dto.js";
import { AddUserToServerDto } from "../../domain/dtos/add-to-server.dto.js";
import { SERVER_ACCESS_REPOSITORY } from "../../domain/repositories/server-access.repository.js";
import type { ServerAccessRepository } from "../../domain/repositories/server-access.repository.js";
import { GetUserServersUseCase } from "../../domain/use-cases/get-user-serves.use-case.js";
import { StartServerDto } from "../../domain/dtos/start-server.dto.js";
import { StartServerUseCase } from "../../domain/use-cases/start-server.use-case.js";
import { StopServerDto } from "../../domain/dtos/stop-server.dto.js";
import { StopServerUseCase } from "../../domain/use-cases/stop-server.use-case.js";
import { JwtAuthGuard } from "./guards/jwt-auth.guard.js";
import { CurrentUserId } from "./decorators/current-user-id.decorator.js";
import { USER_REPOSITORY, type UserRepository } from "../../domain/repositories/user.repository.js";
import { IdFactory, UserId } from "../../domain/value-objects/id.vo.js";
import { SendServerCommandUseCase } from "../../domain/use-cases/send-server-command.use-case.js";

@Controller("servers")
@UseGuards(JwtAuthGuard)
export class ServerController {
  constructor(
    private readonly createServerUseCase: CreateServerUseCase,
    private readonly deleteServerUseCase: DeleteServerUseCase,
    private readonly addUserToServerUseCase: AddUserToServerUseCase,
    @Inject(SERVER_ACCESS_REPOSITORY)
    private readonly serverAccessRepository: ServerAccessRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly getUserServers: GetUserServersUseCase,
    private readonly startServerUseCase: StartServerUseCase,
    private readonly stopServerUseCase: StopServerUseCase,
    private readonly sendCommandUseCase: SendServerCommandUseCase
  ) {}

  @Post()
  async create(@Body() dto: CreateServerDto, @Res() res: Response): Promise<Response> {
    const server = await this.createServerUseCase.execute(dto);
    return res.status(HttpStatus.CREATED).json(server);
  }

  @Delete(":id")
  async delete(
    @Param("id") id: string,
    @CurrentUserId() userId: string,
    @Res() res: Response
  ): Promise<Response> {
    await this.deleteServerUseCase.execute({
      serverId: id,
      requesterId: userId,
    });
    return res.status(HttpStatus.OK).json({ message: "Server deleted successfully" });
  }

  @Post(":id/users")
  async addUser(
    @Param("id") serverId: string,
    @Body("guestEmail") guestEmail: string,
    @CurrentUserId() ownerId: string,
    @Res() res: Response
  ): Promise<Response> {
    const addToServerDto = new AddUserToServerDto(ownerId, guestEmail, serverId);
    await this.addUserToServerUseCase.execute(addToServerDto);

    return res
      .status(HttpStatus.CREATED)
      .json({ message: "Usuario agregado al servidor exitosamente" });
  }

  @Get("")
  async get(@CurrentUserId() userId: string, @Res() res: Response): Promise<Response> {
    const servers = await this.getUserServers.execute(userId);
    return res.status(HttpStatus.OK).json(servers);
  }

  @Get(":id/users")
  async getUsers(@Param("id") serverId: string, @Res() res: Response): Promise<Response> {
    const accesses = await this.serverAccessRepository.findAllByServer(serverId);

    const usersWithEmail = await Promise.all(
      accesses.map(async (a) => {
        const userId = IdFactory.load<UserId>(a.getUserId());
        const user = await this.userRepository.findById(userId);

        return {
          userId: a.getUserId(),
          role: a.getRole(),
          // Obtenemos el correo del Value Object
          email: user ? user.getEmail().toString() : "Usuario desconocido",
          createdAt: a.getCreatedAt(),
        };
      })
    );

    return res.status(HttpStatus.OK).json(usersWithEmail);
  }

  //comentario táctico
  @Post(":id/start")
  async start(
    @Param("id") id: string,
    @CurrentUserId() userId: string,
    @Res() res: Response
  ): Promise<Response> {
    const dto: StartServerDto = {
      serverId: id,
      requesterId: userId,
    };

    await this.startServerUseCase.execute(dto);

    return res
      .status(HttpStatus.OK)
      .json({ message: "Server start process initiated successfully" });
  }

  @Post(":id/stop")
  async stop(
    @Param("id") id: string,
    @CurrentUserId() userId: string,
    @Res() res: Response
  ): Promise<Response> {
    const dto = new StopServerDto(id, userId);

    await this.stopServerUseCase.execute(dto);

    return res.status(HttpStatus.OK).json({ message: "Server stopped successfully" });
  }

  @Post(":id/command")
  async sendCommand(
    @Param("id") id: string,
    @CurrentUserId() userId: string,
    @Body("command") command: string,
    @Res() res: Response
  ): Promise<Response> {
    await this.sendCommandUseCase.execute(id, userId, command);
    return res.status(HttpStatus.OK).json({
      message: "Comando enviado a la consola exitosamente",
    });
  }
}
